import { useEffect, useState, type FormEvent } from 'react'
import { configuracionesApi, type ConfiguracionResponse } from '../../api/configuraciones'
import { ApiError } from '../../api/client'
import { Modal } from '../../components/Modal'

const CLAVES_CONOCIDAS = [
  { nombre: 'CorreoEmpresa', descripcion: 'Casilla que envía los avisos de nuevos pedidos y documentos' },
  { nombre: 'Contraseñamail', descripcion: 'Contraseña de aplicación de esa casilla (SMTP)' },
  { nombre: 'CorreoAdmin', descripcion: 'A dónde llegan los avisos de nuevos pedidos y documentos' },
  { nombre: 'CostoEnvio', descripcion: 'Costo fijo que se suma al pedido cuando el cliente pide envío a domicilio' },
]

export function AdminConfiguracionPage() {
  const [configuraciones, setConfiguraciones] = useState<ConfiguracionResponse[]>([])
  const [nombre, setNombre] = useState('')
  const [valor, setValor] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)

  function cargar() {
    configuracionesApi
      .listar()
      .then(setConfiguraciones)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'No se pudieron cargar las configuraciones'))
  }

  useEffect(cargar, [])

  function abrirModal(nombrePrecargado?: string) {
    setNombre(nombrePrecargado ?? '')
    setValor('')
    setError(null)
    setModalAbierto(true)
  }

  function cerrarModal() {
    setModalAbierto(false)
    setNombre('')
    setValor('')
    setError(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await configuracionesApi.upsert(nombre, valor)
      cerrarModal()
      cargar()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar la configuración')
    }
  }

  const configuradas = new Set(configuraciones.map((c) => c.nombre))

  return (
    <div>
      <div className="page-hero">
        <h1>Configuración</h1>
        <p>Parámetros generales del sistema</p>
      </div>

      <div className="card">
        <h3>Parámetros disponibles</h3>
        <p style={{ marginBottom: 12, color: 'var(--ink-soft)', fontSize: 14 }}>
          Estos parámetros ya están conectados a una funcionalidad real. Hacé clic para cargarlos o editarlos.
        </p>
        {CLAVES_CONOCIDAS.map((clave) => {
          const actual = configuraciones.find((c) => c.nombre === clave.nombre)
          return (
            <div className="row" key={clave.nombre} style={{ justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <strong>{clave.nombre}</strong>
                <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{clave.descripcion}</p>
              </div>
              <div className="row">
                {actual && <span className="badge badge-activa">{clave.nombre === 'Contraseñamail' ? '••••••' : actual.valor}</span>}
                <button className="secondary" onClick={() => abrirModal(clave.nombre)}>
                  {configuradas.has(clave.nombre) ? 'Editar' : 'Cargar'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="section-header">
        <h3>Otros parámetros</h3>
        <button onClick={() => abrirModal()}>Agregar parámetro</button>
      </div>
      {error && !modalAbierto && <p className="error">{error}</p>}

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          {configuraciones
            .filter((c) => !CLAVES_CONOCIDAS.some((k) => k.nombre === c.nombre))
            .map((c) => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td>{c.valor}</td>
              </tr>
            ))}
        </tbody>
      </table>

      {modalAbierto && (
        <Modal title={nombre ? `Configurar ${nombre}` : 'Nuevo parámetro'} onClose={cerrarModal}>
          <form onSubmit={handleSubmit}>
            <label>
              Nombre
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="CorreoEmpresa"
                required
                readOnly={CLAVES_CONOCIDAS.some((k) => k.nombre === nombre)}
              />
            </label>
            <label>
              Valor
              <input
                type={nombre === 'Contraseñamail' ? 'password' : 'text'}
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                required
              />
            </label>
            {error && <p className="error">{error}</p>}
            <button type="submit">Guardar</button>
          </form>
        </Modal>
      )}
    </div>
  )
}
