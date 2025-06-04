// src/app/auth/[...nextauth]/route.js
// NO MOVER ESTE ARCHIVO A OTRO LADO, SU RUTA ES ESENCIAL PARA NEXTAUTH.JS

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import prisma from '@/lib/prisma'; // <-- VERIFICA QUE ESTA LÍNEA ESTÉ CORRECTA
import bcrypt from 'bcryptjs';

// console.log('DEBUG (nextauth/route.js): Prisma instance after import:', prisma ? 'DEFINIDO' : 'UNDEFINED'); // Puedes dejar el log si quieres

/* ───── helper para refrescar token Google ───────────── */
async function refreshAccessToken(token) {
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id:     process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        grant_type:    'refresh_token',
        refresh_token: token.refreshToken,
      }),
    });

    const refreshed = await res.json();
    if (!res.ok) throw refreshed;

    return {
      ...token,
      accessToken:        refreshed.access_token,
      accessTokenExpires: Date.now() + refreshed.expires_in * 1000,
      refreshToken:       refreshed.refresh_token ?? token.refreshToken,
    };
  } catch (err) {
    console.error('Error refrescando Google token:', err);
    return { ...token, error: 'RefreshAccessTokenError' };
  }
}

export const authOptions = {
  // No hay "adapter: PrismaAdapter(prisma)" aquí
  providers: [
    /* Login propio con Prisma ------------------------------------ */
    CredentialsProvider({
      name: 'Credenciales',
      credentials: {
        email:    { label: 'Correo',     type: 'email'    },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (user && await bcrypt.compare(credentials.password, user.password)) {
          // Si el usuario es autenticado, devolver su ID de Prisma. NextAuth lo usará para el JWT.
          return { id: user.id, name: user.name, email: user.email }; // Usar user.id sin .toString() para mantener el tipo original
        }
        return null; // -> 401
      },
    }),

    /* Google Calendar -------------------------------------------- */
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope:
            'openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/gmail.readonly',
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
      // ¡¡¡NUEVO CALLBACK signIn PARA GOOGLEPROVIDER!!!
      async signIn({ user, account, profile, email, credentials }) {
        // 'user' aquí es el objeto devuelto por el proveedor (Google)
        // 'profile' es el perfil completo de Google
        
        // Buscar el usuario en nuestra DB por email
        const existingUser = await prisma.user.findUnique({
          where: { email: profile.email },
        });

        if (existingUser) {
          // Usuario encontrado en nuestra DB (existe el control de acceso)
          // Puedes añadir lógica adicional aquí si el usuario debe ser 'activo' o algo.
          return true; // Permitir el inicio de sesión
        } else {
          // Usuario NO encontrado en nuestra DB. No tiene acceso.
          // Redirigir a una página de error o denegar el login.
          console.warn(`Intento de login con Google para email no autorizado: ${profile.email}`);
          // NextAuth denegará el login. Puedes personalizar la página de error.
          return '/auth/error?error=AccessDeniedByPolicy'; // O un booleano `false` para error genérico
        }
      },
    }),
  ],

  session: { strategy: 'jwt' },
  jwt:     { secret: process.env.NEXTAUTH_SECRET },

  pages: {
    signIn: '/auth/signin',
    error:  '/auth/error', // Asegúrate de manejar este error personalizado en tu página de error
  },

  callbacks: {
    /* ─ jwt: guarda datos extra para Google (principalmente tokens) y el ID de Prisma ─ */
    async jwt({ token, user, account }) {
      // 'user' está presente si es un nuevo inicio de sesión (OAuth) o si authorize devuelve un user (Credentials)
      if (user) {
        // Para CredentialsProvider, user.id ya es el ID de Prisma
        // Para GoogleProvider (con el `signIn` de arriba), si el login se permite,
        // necesitamos buscar el ID de Prisma por email y añadirlo al token.
        let prismaUserId = user.id; // Podría ser el ID de Google en el primer paso si no lo buscamos
        
        // Si el login es con Google, asegurémonos de que el token.id sea el ID de Prisma.
        if (account?.provider === 'google') {
          // Buscar el usuario de Prisma por email
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email || user.email }, // Usar el email del token o del user del callback
            select: { id: true } // Solo necesitamos el ID
          });
          if (dbUser) {
            prismaUserId = dbUser.id; // ¡Este es el ID de Prisma que necesitamos!
          } else {
            console.error(`JWT Callback: Usuario de Prisma no encontrado para el email ${token.email || user.email} durante login de Google.`);
            // Podrías decidir denegar la sesión o marcar un error aquí si el usuario no se encontró.
            // Para ahora, vamos a dejar que el flujo continúe, pero es una anomalía.
          }
          
          token.accessToken        = account.access_token;
          token.accessTokenExpires = Date.now() + account.expires_in * 1000;
          token.refreshToken       = account.refresh_token;
        }
        token.id = prismaUserId; // ¡Asignar el ID de Prisma al token.id!
      }
      
      // Si el token de Google existe y expiró → refrescar
      if (token.accessTokenExpires && Date.now() >= token.accessTokenExpires) {
        token = await refreshAccessToken(token);
      }

      return token;
    },

    /* ─ session: expone los tokens al servidor y el ID de Prisma ─ */
    async session({ session, token }) {
      // El ID de Prisma ya está en token.id gracias al callback jwt
      session.user.id     = token.id; 
      session.user.email  = token.email; // Asegura que el email del token se use

      session.accessToken = token.accessToken;
      session.refreshToken= token.refreshToken;
      session.error       = token.error;
      session.expiresAt   = token.accessTokenExpires; // Para refrescar tokens de Google

      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };