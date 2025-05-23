// src/app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Correo", type: "email", placeholder: "tú@ejemplo.com" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize({ email, password }) {
        // 1) Busca el usuario en la BD
        const user = await prisma.user.findUnique({
          where: { email }
        })
        // 2) Si existe y la contraseña coincide, devuélvelo
        if (user && await bcrypt.compare(password, user.password)) {
          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email
          }
        }
        // Si no, devuelve null -> 401
        return null
      }
    })
  ],

  session: {
    strategy: "jwt"
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error"  // mostrará el query ?error=…
  },

  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub
      return session
    }
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
