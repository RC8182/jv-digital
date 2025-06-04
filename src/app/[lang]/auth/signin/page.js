// src/app/auth/signin/page.js
'use client';

import { getProviders, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignInPage() {
  const [providers, setProviders] = useState(null);
  const router = useRouter();
  const params = useSearchParams();

  // Obtener la URL de callback de los parámetros de la URL,
  // o establecerla a la ruta raíz del dashboard si no se proporciona ninguna.
  // Aseguramos que siempre apunte al nuevo dashboard
  const callbackUrl = params.get('callbackUrl') || '/es/dashboard'; // <-- ¡CAMBIO CLAVE AQUÍ!
  // He puesto '/es/dashboard' como fallback. Asegúrate de que '/es' sea tu idioma por defecto o ajusta la lógica si manejas múltiples idiomas al inicio.
  // Idealmente, el middleware ya debería incluir el idioma en la callbackUrl si te redirige.

  // Si NextAuth te redirige, suele añadir un parámetro 'error'.
  // Puedes usarlo para mostrar un mensaje al usuario.
  const error = params.get('error');

  useEffect(() => {
    getProviders().then(setProviders);
  }, []);

  // Puedes añadir un mensaje de error si existe
  const errorMessage = error && (
    <div className="bg-red-500 text-white p-3 rounded-md mb-4 text-center">
      {error === 'SessionRequired' && 'Debes iniciar sesión para acceder a esta página.'}
      {error === 'AccessDeniedByPolicy' && 'Acceso denegado. Tu cuenta no tiene permisos para esta sección.'}
      {error === 'CredentialsSignin' && 'Credenciales inválidas. Por favor, verifica tu correo y contraseña.'}
      {/* Añade más mensajes para otros errores si es necesario */}
      {!['SessionRequired', 'AccessDeniedByPolicy', 'CredentialsSignin'].includes(error) && `Error al iniciar sesión: ${error}`}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8 space-y-6 border border-gray-700">
        <h1 className="text-3xl font-bold text-center text-teal-400 mb-6">Iniciar Sesión</h1>
        {errorMessage}

        {providers && Object.values(providers).map((prov) => (
          <div key={prov.name}>
            {prov.id === "credentials" ? (
              <form onSubmit={async e => {
                e.preventDefault();
                await signIn("credentials", {
                  email: e.target.email.value,
                  password: e.target.password.value,
                  callbackUrl // Usamos la callbackUrl derivada de los params o el fallback
                });
              }}>
                <input
                  name="email"
                  type="email"
                  placeholder="Correo Electrónico"
                  required
                  className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-teal-500 focus:ring focus:ring-teal-500 focus:ring-opacity-50 mb-3 placeholder-gray-400"
                />
                <input
                  name="password"
                  type="password"
                  placeholder="Contraseña"
                  required
                  className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-teal-500 focus:ring focus:ring-teal-500 focus:ring-opacity-50 mb-4 placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="w-full bg-teal-600 text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 font-semibold py-3 px-4 rounded-md transition-colors duration-200"
                >
                  Entrar con {prov.name}
                </button>
              </form>
            ) : (
              <button
                onClick={() => signIn(prov.id, { callbackUrl })}
                className="w-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 font-semibold py-3 px-4 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                {/* Opcional: un icono de Google */}
                {/* <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">...</svg> */}
                <span>Entrar con {prov.name}</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}