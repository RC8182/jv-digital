// src/app/[lang]/dashboard/users/page.js
"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function UsersPage() {
  const { status } = useSession({ required: true })
  const [users, setUsers] = useState([])

  // Ahora guardamos también epigrafesIAE (como string con comas)
  const [form, setForm] = useState({
    id: null,
    name: '',
    email: '',
    password: '',
    epigrafesIAE: ''  // ← Nuevo campo
  })

  // Cargar lista de usuarios
  const loadUsers = async () => {
    try {
      const res = await fetch('/api/users')
      if (!res.ok) {
        console.error("Error en la API:", res.status, res.statusText)
        throw new Error(res.statusText)
      }
      const data = await res.json()
      setUsers(data)
    } catch (e) {
      console.error("Error al cargar usuarios:", e)
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      loadUsers()
    }
  }, [status])

  // Crear o actualizar usuario
  const saveUser = async e => {
    e.preventDefault()

    // Convertir el string "765,844" en ["765","844"]
    const epigrafesArray = form.epigrafesIAE
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    const payload = {
      name: form.name,
      email: form.email,
      epigrafesIAE: epigrafesArray
    }
    if (form.password) {
      payload.password = form.password
    }

    const method = form.id ? 'PUT' : 'POST'
    const url = form.id
      ? `/api/users/${form.id}`
      : '/api/users'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || res.statusText)
      }
      // Limpiar el formulario
      setForm({ id: null, name: '', email: '', password: '', epigrafesIAE: '' })
      loadUsers()
    } catch (e) {
      console.error("Error al guardar usuario:", e)
      alert(`Error al guardar usuario: ${e.message}`)
    }
  }

  // Cargar datos al formulario para editar
  const editUser = user => {
    setForm({
      id: user.id,
      name: user.name,
      email: user.email,
      password: '',
      epigrafesIAE: Array.isArray(user.epigrafesIAE)
        ? user.epigrafesIAE.join(',')
        : ''
    })
  }

  // Eliminar usuario
  const deleteUser = async id => {
    if (!confirm('¿Eliminar este usuario? Esta acción es irreversible y podría afectar datos relacionados.')) {
      return
    }
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || res.statusText)
      }
      loadUsers()
    } catch (e) {
      console.error("Error al borrar usuario:", e)
      alert(`Error al borrar usuario: ${e.message}`)
    }
  }

  // Indicador mientras se autentica
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <p>Cargando usuarios...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-lg mx-auto bg-gray-900 text-white rounded-lg shadow-xl">
      <h2 className="text-xl font-bold text-teal-400 mb-4">Usuarios</h2>

      {users.length > 0 ? (
        <ul className="mb-6 space-y-2">
          {users.map(u => (
            <li
              key={u.id}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-700 py-2"
            >
              <div>
                <span className="font-semibold text-white">{u.name}</span> ({u.email})
                <div className="text-xs text-gray-400">
                  Epígrafes: {Array.isArray(u.epigrafesIAE) && u.epigrafesIAE.length > 0
                    ? u.epigrafesIAE.join(', ')
                    : '—'}
                </div>
              </div>
              <div className="flex space-x-2 mt-1 sm:mt-0">
                <button
                  onClick={() => editUser(u)}
                  className="text-blue-500 hover:text-blue-400 font-semibold"
                >
                  Editar
                </button>
                <button
                  onClick={() => deleteUser(u.id)}
                  className="text-red-500 hover:text-red-400 font-semibold"
                >
                  Borrar
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-6 text-gray-400 text-center">
          No hay usuarios para mostrar. Crea uno usando el formulario de abajo.
        </p>
      )}

      {/* Formulario de creación/edición */}
      <form onSubmit={saveUser} className="space-y-4 text-white">
        <h3 className="text-xl font-semibold text-teal-400 mb-2">
          {form.id ? "Editar Usuario" : "Crear Nuevo Usuario"}
        </h3>

        <input
          placeholder="Nombre"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="w-full border p-2 rounded bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-teal-500 focus:border-teal-500"
          required
        />

        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          className="w-full border p-2 rounded bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-teal-500 focus:border-teal-500"
          required
        />

        <input
          placeholder={form.id ? "Nueva contraseña (opcional)" : "Contraseña"}
          type="password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          className="w-full border p-2 rounded bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-teal-500 focus:border-teal-500"
          required={!form.id}
        />

        <input
          placeholder="Epígrafes IAE (separados por comas)"
          value={form.epigrafesIAE}
          onChange={e => setForm({ ...form, epigrafesIAE: e.target.value })}
          className="w-full border p-2 rounded bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-teal-500 focus:border-teal-500"
        />

        <button
          type="submit"
          className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 font-semibold shadow-md transition-colors"
        >
          {form.id ? 'Actualizar Usuario' : 'Crear Usuario'}
        </button>
      </form>
    </div>
  )
}
