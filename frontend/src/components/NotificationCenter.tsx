import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificacionesApi, rutaDeNotificacion, type NotificacionResponse } from '../api/notificaciones'

const POLL_MS = 12000
const TOAST_MS = 8000

export function NotificationCenter() {
  const navigate = useNavigate()
  const [noLeidas, setNoLeidas] = useState<NotificacionResponse[]>([])
  const [abierta, setAbierta] = useState(false)
  const [toasts, setToasts] = useState<NotificacionResponse[]>([])
  const vistasRef = useRef<Set<number>>(new Set())
  const contenedorRef = useRef<HTMLDivElement>(null)
  const primeraCargaRef = useRef(true)

  useEffect(() => {
    let cancelado = false

    async function poll() {
      try {
        const actuales = await notificacionesApi.noLeidas()
        if (cancelado) return

        if (primeraCargaRef.current) {
          actuales.forEach((n) => vistasRef.current.add(n.id))
          primeraCargaRef.current = false
        } else {
          const nuevas = actuales.filter((n) => !vistasRef.current.has(n.id))
          nuevas.forEach((n) => vistasRef.current.add(n.id))
          if (nuevas.length > 0) {
            setToasts((prev) => [...prev, ...nuevas])
            nuevas.forEach((n) => {
              setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== n.id)), TOAST_MS)
            })
          }
        }

        setNoLeidas(actuales)
      } catch {
        // silencioso: si falla el polling no interrumpimos la app
      }
    }

    poll()
    const interval = setInterval(poll, POLL_MS)
    return () => {
      cancelado = true
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    function handleClickFuera(e: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierta(false)
      }
    }
    document.addEventListener('mousedown', handleClickFuera)
    return () => document.removeEventListener('mousedown', handleClickFuera)
  }, [])

  async function irANotificacion(n: NotificacionResponse) {
    setToasts((prev) => prev.filter((t) => t.id !== n.id))
    setNoLeidas((prev) => prev.filter((x) => x.id !== n.id))
    setAbierta(false)
    try {
      await notificacionesApi.marcarLeida(n.id)
    } catch {
      // no bloqueamos la navegación si falla marcar como leída
    }
    navigate(rutaDeNotificacion(n))
  }

  async function marcarTodasLeidas() {
    const idsActuales = noLeidas.map((n) => n.id)
    setNoLeidas([])
    setAbierta(false)
    try {
      await notificacionesApi.marcarTodasLeidas()
    } catch {
      // si falla, la próxima recarga las va a volver a mostrar
    }
    setToasts((prev) => prev.filter((t) => !idsActuales.includes(t.id)))
  }

  return (
    <>
      <div className="notification-center" ref={contenedorRef}>
        <button className="notification-bell" onClick={() => setAbierta((v) => !v)} aria-label="Notificaciones">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 16v-5a6 6 0 0 0-4-5.65V4a2 2 0 0 0-4 0v1.35A6 6 0 0 0 6 11v5l-1.7 1.7A1 1 0 0 0 5 19.4h14a1 1 0 0 0 .7-1.7L18 16Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M10 21a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          {noLeidas.length > 0 && <span className="notification-badge">{noLeidas.length}</span>}
        </button>

        {abierta && (
          <div className="notification-dropdown">
            <div className="notification-dropdown-header">
              <strong>Notificaciones</strong>
              {noLeidas.length > 0 && (
                <button className="link-button" onClick={marcarTodasLeidas}>
                  Marcar todas como leídas
                </button>
              )}
            </div>
            {noLeidas.length === 0 && <p className="empty-state">No hay notificaciones nuevas.</p>}
            <div className="notification-list">
              {noLeidas.map((n) => (
                <button key={n.id} className="notification-item" onClick={() => irANotificacion(n)}>
                  <span className="notification-item-title">{n.nombreUsuario}</span>
                  <span className="notification-item-body">{n.accionUsuario}</span>
                  <span className="notification-item-time">{new Date(n.fecha).toLocaleString()}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="toast-stack">
        {toasts.map((t) => (
          <button key={t.id} className="toast" onClick={() => irANotificacion(t)}>
            <strong>{t.tipoNotificacion === 'Notificaciones Documentos' ? 'Nuevo documento' : 'Nuevo pedido'}</strong>
            <span>{t.accionUsuario}</span>
          </button>
        ))}
      </div>
    </>
  )
}
