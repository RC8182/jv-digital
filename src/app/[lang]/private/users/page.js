// File: src/app/[lang]/private/users/page.js
"use client"

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'

export default function UsersPage() {
  const { status } = useSession({ required: true })
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ id: null, name: '', email: '', password: '' })

  // Leer lista de usuarios
  const loadUsers = async () => {
    const res = await fetch('/api/private/users')
    if (res.ok) setUsers(await res.json())
  }

  useEffect(() => {
    loadUsers()
  }, [])

  // Crear o actualizar usuario
  const saveUser = async e => {
    e.preventDefault()
    const payload = { name: form.name, email: form.email }
    if (form.password) payload.password = form.password
    const method = form.id ? 'PUT' : 'POST'
    const url = form.id ? `/api/private/users/${form.id}` : '/api/private/users'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (res.ok) {
      setForm({ id: null, name: '', email: '', password: '' })
      loadUsers()
    }
  }

  // Editar: cargar datos al formulario (sin exponer contraseña)
  const editUser = user => {
    setForm({ id: user.id, name: user.name, email: user.email, password: '' })
  }

  // Eliminar usuario
  const deleteUser = async id => {
    if (!confirm('¿Eliminar este usuario?')) return
    const res = await fetch(`/api/private/users/${id}`, { method: 'DELETE' })
    if (res.ok) loadUsers()
  }

  if (status === 'loading') return <p>Cargando...</p>

  return (
    <div className="p-6 max-w-lg mx-auto">
      <header className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Usuarios</h2>
        <button onClick={() => signOut({ callbackUrl: '/' })} className="underline text-sm">
          Cerrar sesión
        </button>
      </header>

      {/* Listado de usuarios */}
      <ul className="mb-4">
        {users.map(u => (
          <li key={u.id} className="flex justify-between items-center border-b py-1">
            <span>{u.name} ({u.email})</span>
            <div className="space-x-2">
              <button onClick={() => editUser(u)} className="text-blue-600">Editar</button>
              <button onClick={() => deleteUser(u.id)} className="text-red-600">Borrar</button>
            </div>
          </li>
        ))}
      </ul>

      {/* Formulario de creación/edición */}
      <form onSubmit={saveUser} className="space-y-2">
        <input
          placeholder="Nombre"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <input
          placeholder="Contraseña"
          type="password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          {form.id ? 'Actualizar' : 'Crear'} usuario
        </button>
      </form>
    </div>
  )
}