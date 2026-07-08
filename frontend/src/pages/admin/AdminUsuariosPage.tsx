import { useEffect, useState } from 'react'
import type { UsuarioResponse } from '../../api/auth'
import { usuariosApi, type NivelResponse } from '../../api/usuarios'
import { ApiError } from '../../api/client'
import { EstadoBadge } from '../../components/EstadoBadge'
import { useAuth } from '../../auth/AuthContext'
import { PageHeader } from '../../components/PageHeader'
import { iniciales } from '../../lib/iniciales'
import { categoryStyle } from '../../lib/categoryColor'
import styles from './AdminUsuariosPage.module.css'

export function AdminUsuariosPage() {
  const { usuario: usuarioActual } = useAuth()
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
      <PageHeader title="Usuarios" subtitle="Gestioná roles y acceso de clientes, docentes y administradores" />
      {error && <p className="error">{error}</p>}
      <div className="card table-card">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => {
              const esUsuarioActual = u.id === usuarioActual?.id
              return (
                <tr key={u.id}>
                  <td>
                    <div className={styles.avatar}>{iniciales(u.nombre)}</div>
                  </td>
                  <td>
                    {u.nombre}
                    {esUsuarioActual && (
                      <span className="badge" style={{ marginLeft: 6 }}>
                        Vos
                      </span>
                    )}
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      className={styles.roleSelect}
                      style={categoryStyle(u.nivel)}
                      value={niveles.find((n) => n.nombre === u.nivel)?.id ?? ''}
                      onChange={(e) => handleCambiarNivel(u.id, Number(e.target.value))}
                      disabled={esUsuarioActual}
                      title={esUsuarioActual ? 'No podés cambiar tu propio rol' : undefined}
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
                    <button
                      className="secondary"
                      onClick={() => handleToggleActivo(u)}
                      disabled={esUsuarioActual}
                      title={esUsuarioActual ? 'No podés activar o desactivar tu propia cuenta' : undefined}
                    >
                      {u.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
