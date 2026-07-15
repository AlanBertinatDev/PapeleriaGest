import { useEffect, useState, type FormEvent } from 'react'
import { configuracionesApi, type ConfiguracionResponse } from '../../api/configuraciones'
import { ApiError } from '../../api/client'
import { Modal } from '../../components/Modal'
import { PageHeader } from '../../components/PageHeader'
import styles from './AdminConfiguracionPage.module.css'

type ParamTipo = 'email' | 'password' | 'currency'

interface ParamDef {
  nombre: string
  label: string
  descripcion: string
  tipo: ParamTipo
}

interface Grupo {
  icono: string
  titulo: string
  parametros: ParamDef[]
}

const GRUPOS: Grupo[] = [
  {
    icono: '✉️',
    titulo: 'Notificaciones por correo',
    parametros: [
      {
        nombre: 'CorreoEmpresa',
        label: 'Correo remitente',
        descripcion: 'Casilla de Gmail que envía los avisos (queda como remitente del mail).',
        tipo: 'email',
      },
      {
        nombre: 'Contraseñamail',
        label: 'Contraseña de aplicación',
        descripcion: 'Se genera en myaccount.google.com/apppasswords, no es la contraseña normal de la cuenta.',
        tipo: 'password',
      },
      {
        nombre: 'CorreoAdmin',
        label: 'Correo de destino',
        descripcion:
          'A dónde llegan los avisos de nuevos pedidos y documentos. Admite varias direcciones separadas por coma.',
        tipo: 'email',
      },
    ],
  },
  {
    icono: '🛒',
    titulo: 'Comercial',
    parametros: [
      {
        nombre: 'CostoEnvio',
        label: 'Costo de envío',
        descripcion: 'Costo fijo que se suma al pedido cuando el cliente pide envío a domicilio.',
        tipo: 'currency',
      },
    ],
  },
  {
    icono: '🖨️',
    titulo: 'Impresión',
    parametros: [
      {
        nombre: 'ImpresionBN',
        label: 'Precio por copia — Blanco y negro',
        descripcion: 'Precio base por cada copia impresa en blanco y negro.',
        tipo: 'currency',
      },
      {
        nombre: 'ImpresionColorLaser',
        label: 'Precio por copia — Color láser',
        descripcion: 'Precio base por cada copia impresa a color láser.',
        tipo: 'currency',
      },
      {
        nombre: 'ImpresionColorTinta',
        label: 'Precio por copia — Color tinta',
        descripcion: 'Precio base por cada copia impresa a color tinta.',
        tipo: 'currency',
      },
      {
        nombre: 'ImpresionExtraA3',
        label: 'Extra por tamaño A3',
        descripcion: 'Monto adicional por copia cuando se elige papel A3 (se suma al precio base de color).',
        tipo: 'currency',
      },
      {
        nombre: 'ImpresionExtraA5',
        label: 'Extra por tamaño A5',
        descripcion: 'Monto adicional por copia cuando se elige papel A5. Podés dejarlo en 0 si no tiene diferencia.',
        tipo: 'currency',
      },
      {
        nombre: 'ImpresionExtra160g',
        label: 'Extra por papel 160g',
        descripcion: 'Monto adicional por copia cuando se elige papel grueso de 160g.',
        tipo: 'currency',
      },
      {
        nombre: 'ImpresionExtra200g',
        label: 'Extra por papel 200g (cartulina)',
        descripcion: 'Monto adicional por copia cuando se elige cartulina de 200g.',
        tipo: 'currency',
      },
      {
        nombre: 'ImpresionExtraFoto',
        label: 'Extra por papel fotográfico',
        descripcion: 'Monto adicional por copia cuando se elige papel fotográfico.',
        tipo: 'currency',
      },
      {
        nombre: 'ImpresionEncuadernacion',
        label: 'Precio — Encuadernación',
        descripcion: 'Costo fijo por encuadernar el trabajo (se suma una sola vez, sin importar las copias).',
        tipo: 'currency',
      },
      {
        nombre: 'ImpresionGrapado',
        label: 'Precio — Grapado',
        descripcion: 'Costo fijo por grapar el trabajo.',
        tipo: 'currency',
      },
      {
        nombre: 'ImpresionAgujeros',
        label: 'Precio — 2 agujeros',
        descripcion: 'Costo fijo por perforar el trabajo con 2 agujeros.',
        tipo: 'currency',
      },
    ],
  },
]

const NOMBRES_CONOCIDOS = new Set(GRUPOS.flatMap((g) => g.parametros.map((p) => p.nombre)))

interface ModalInfo {
  titulo: string
  tipo: ParamTipo | 'custom'
}

export function AdminConfiguracionPage() {
  const [configuraciones, setConfiguraciones] = useState<ConfiguracionResponse[]>([])
  const [error, setError] = useState<string | null>(null)
  const [modalInfo, setModalInfo] = useState<ModalInfo | null>(null)
  const [nombre, setNombre] = useState('')
  const [valor, setValor] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)

  function cargar() {
    configuracionesApi
      .listar()
      .then(setConfiguraciones)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'No se pudieron cargar las configuraciones'))
  }

  useEffect(cargar, [])

  function abrirModalSistema(def: ParamDef) {
    const actual = configuraciones.find((c) => c.nombre === def.nombre)
    setNombre(def.nombre)
    setValor(def.tipo === 'password' ? '' : (actual?.valor ?? ''))
    setModalInfo({ titulo: def.label, tipo: def.tipo })
    setMostrarPassword(false)
    setError(null)
  }

  function abrirModalCustom(nombreExistente?: string) {
    const actual = nombreExistente ? configuraciones.find((c) => c.nombre === nombreExistente) : undefined
    setNombre(nombreExistente ?? '')
    setValor(actual?.valor ?? '')
    setModalInfo({ titulo: nombreExistente ?? 'Nuevo parámetro', tipo: 'custom' })
    setError(null)
  }

  function cerrarModal() {
    setModalInfo(null)
    setNombre('')
    setValor('')
    setMostrarPassword(false)
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

  async function handleEliminar(id: number, nombreParametro: string) {
    if (!window.confirm(`¿Eliminar el parámetro "${nombreParametro}"?`)) return
    setError(null)
    try {
      await configuracionesApi.eliminar(id)
      cargar()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar el parámetro')
    }
  }

  const yaExiste = configuraciones.some((c) => c.nombre === nombre)
  const otros = configuraciones.filter((c) => !NOMBRES_CONOCIDOS.has(c.nombre))

  return (
    <div>
      <PageHeader title="Configuración" subtitle="Parámetros generales del sistema" />
      {error && !modalInfo && <p className="error">{error}</p>}

      {GRUPOS.map((grupo) => (
        <div key={grupo.titulo}>
          <div className={styles.groupHeader}>
            <div className={styles.groupHeaderTitle}>
              <span className={styles.groupIcon}>{grupo.icono}</span>
              <span className={styles.groupTitle}>{grupo.titulo}</span>
            </div>
          </div>
          <div className={styles.groupCard}>
            {grupo.parametros.map((def) => {
              const actual = configuraciones.find((c) => c.nombre === def.nombre)
              return (
                <div className={styles.paramRow} key={def.nombre}>
                  <div>
                    <div className={styles.paramName}>{def.label}</div>
                    <div className={styles.paramDesc}>{def.descripcion}</div>
                  </div>
                  <div className={styles.paramActions}>
                    {actual &&
                      (def.tipo === 'password' ? (
                        <span className={`${styles.valuePill} ${styles.password}`}>🔒 ••••••••••••</span>
                      ) : def.tipo === 'email' ? (
                        <span className={`${styles.valuePill} ${styles.email}`}>📧 {actual.valor}</span>
                      ) : (
                        <span className={`${styles.valuePill} ${styles.currency}`}>${actual.valor}</span>
                      ))}
                    <button className={styles.editBtn} onClick={() => abrirModalSistema(def)}>
                      {def.tipo === 'password' ? 'Cambiar' : actual ? 'Editar' : 'Cargar'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      <div className={styles.otrosHeader}>
        <div className={styles.groupHeaderTitle}>
          <span className={styles.groupIcon}>⚙️</span>
          <span className={styles.groupTitle}>Otros parámetros</span>
        </div>
        <button onClick={() => abrirModalCustom()}>+ Agregar parámetro</button>
      </div>

      <div className="card table-card">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Valor</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {otros.map((c) => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td>{c.valor}</td>
                <td className="row" style={{ justifyContent: 'flex-end' }}>
                  <button className="secondary" onClick={() => abrirModalCustom(c.nombre)}>
                    Editar
                  </button>
                  <button className="secondary" onClick={() => handleEliminar(c.id, c.nombre)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {otros.length === 0 && (
          <div className={styles.emptyOtros}>
            Todavía no agregaste parámetros personalizados. Usalos para configuraciones puntuales que no están en
            las categorías de arriba.
          </div>
        )}
      </div>

      {modalInfo && (
        <Modal title={modalInfo.titulo} onClose={cerrarModal}>
          <form onSubmit={handleSubmit}>
            {modalInfo.tipo === 'email' && (
              <div>
                <label className={styles.modalLabel}>Dirección de Gmail</label>
                <div className={styles.highlightBox}>
                  <span>📧</span>
                  <input type="email" value={valor} onChange={(e) => setValor(e.target.value)} required autoFocus />
                </div>
                <div className={styles.modalHelp}>Ej: contacto@tupapeleria.com</div>
              </div>
            )}

            {modalInfo.tipo === 'password' && (
              <div>
                <label className={styles.modalLabel}>Nueva contraseña de aplicación</label>
                <div className={styles.plainBox}>
                  <span>🔒</span>
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    className={styles.mostrarToggle}
                    onClick={() => setMostrarPassword((v) => !v)}
                  >
                    {mostrarPassword ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
                <div className={styles.modalHelp}>
                  Se genera en myaccount.google.com/apppasswords con la verificación en 2 pasos activada.
                </div>
              </div>
            )}

            {modalInfo.tipo === 'currency' && (
              <div>
                <label className={styles.modalLabel}>Monto fijo</label>
                <div className={`${styles.highlightBox} ${styles.currencyBox}`}>
                  <span className={styles.currencyPrefix}>$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>
            )}

            {modalInfo.tipo === 'custom' && (
              <>
                <label>
                  Nombre
                  <input
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="MiParametro"
                    required
                    readOnly={yaExiste}
                  />
                </label>
                <label>
                  Valor
                  <input value={valor} onChange={(e) => setValor(e.target.value)} required autoFocus={yaExiste} />
                </label>
              </>
            )}

            {error && <p className="error">{error}</p>}
            <button type="submit" className={styles.modalSubmit}>
              {modalInfo.tipo === 'password' ? 'Guardar contraseña' : 'Guardar'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
