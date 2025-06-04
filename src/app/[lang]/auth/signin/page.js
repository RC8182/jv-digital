// src/app/auth/signin/page.js
'use client';

import { signIn } from "next-auth/react"; // CAMBIO: Ya no necesitamos getProviders
import { useRouter, useSearchParams } from "next/navigation";

export default function SignInPage() {
  // CAMBIO: Ya no necesitamos el estado `providers`
  const router = useRouter();
  const params = useSearchParams();

  // Obtener la URL de callback de los parámetros de la URL,
  // o establecerla a la ruta raíz del dashboard si no se proporciona ninguna.
  const callbackUrl = params.get('callbackUrl') || '/es/dashboard'; 

  // Si NextAuth te redirige, suele añadir un parámetro 'error'.
  const error = params.get('error');



  // Mensaje de error si existe
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

        {/* CAMBIO: Eliminamos el mapeo de proveedores y el formulario de credenciales.
           Ahora solo hay un botón para iniciar sesión con Google. */}
        <button
          onClick={() => signIn("google", { callbackUrl })} // CAMBIO: Llama directamente a signIn con "google"
          className="w-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 font-semibold py-3 px-4 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          {/* Icono de Google (opcional, puedes incluir uno SVG real) */}

          <span>Entrar con Google</span>
        </button>
      </div>
    </div>
  );
}