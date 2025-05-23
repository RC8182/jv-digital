"use client"
import { getProviders, signIn } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function SignInPage() {
  const [providers, setProviders] = useState(null)
  const router = useRouter()
  const params = useSearchParams()
  // Establecemos la URL de callback a la factura privada:
  const callbackUrl = `/private/invoices`

  useEffect(() => {
    getProviders().then(setProviders)
  }, [])

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl mb-4">Iniciar sesión</h1>
      {providers && Object.values(providers).map((prov) => (
        <div key={prov.name} className="mb-2">
          {prov.id === "credentials" ? (
            <form onSubmit={async e => {
              e.preventDefault()
              await signIn("credentials", {
                email: e.target.email.value,
                password: e.target.password.value,
                callbackUrl
              })
              // NextAuth redirige automáticamente al callbackUrl
            }}>
              <input name="email" type="email" placeholder="Correo" required className="w-full mb-2" />
              <input name="password" type="password" placeholder="Contraseña" required className="w-full mb-2" />
              <button type="submit" className="w-full">Entrar</button>
            </form>
          ) : (
            <button
              onClick={() => signIn(prov.id, { callbackUrl })}
              className="w-full"
            >
              Entrar con {prov.name}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
