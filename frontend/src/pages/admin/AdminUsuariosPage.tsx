import { useEffect, useState } from 'react'
import type { UsuarioResponse } from '../../api/auth'
import { usuariosApi, type NivelResponse } from '../../api/usuarios'
import { ApiError } from '../../api/client'
import { EstadoBadge } from '../../components/EstadoBadge'

export function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([])
  const [niveles, setNiveles] = useState<NivelResponse[]>([])
  const [error, setError] = useState<string | null>(null)

  function cargar() {
    usuariosApi
      .listar()
      .then(setUsuarios)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los usuarios'))
    usuariosApi.listarNiveles().then(setNiveles).catch(() => {})
  }

  useEffect(cargar, [])

  async function handleCambiarNivel(id: number, nivelId: number) {
    setError(null)
    try {
      await usuariosApi.cambiarNivel(id, nivelId)
      cargar()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cambiar el rol')
    }
  }

  async function handleToggleActivo(usuario: UsuarioResponse) {
    setError(null)
    try {
      if (usuario.activo) {
        await usuariosApi.desactivar(usuario.id)
      } else {
        await usuariosApi.activar(usuario.id)
      }
      cargar()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo actualizar el usuario')
    }
  }

  return (
    <div>
      <div className="page-hero">
        <h1>Usuarios</h1>
        <p>Gestioná roles y acceso de clientes, docentes y administradores</p>
      </div>
      {error && <p className="error">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <td>{u.nombre}</td>
              <td>{u.email}</td>
              <td>
                <select
                  value={niveles.find((n) => n.nombre === u.nivel)?.id ?? ''}
                  onChange={(e) => handleCambiarNivel(u.id, Number(e.target.value))}
                >
                  {niveles.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.nombre}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <EstadoBadge estado={u.activo ? 'Activa' : 'Inactiva'} />
              </td>
              <td>
                <button className="secondary" onClick={() => handleToggleActivo(u)}>
                  {u.activo ? 'Desactivar' : 'Activar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
