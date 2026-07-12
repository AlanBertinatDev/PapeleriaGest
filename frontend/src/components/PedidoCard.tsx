import { useState } from 'react'
import { documentosApi, type DocumentoResponse } from '../api/documentos'
import { pedidosApi, type PedidoResponse } from '../api/pedidos'
import { ApiError } from '../api/client'
import { linkEmail, linkWhatsapp } from '../lib/contacto'
import { EstadoBadge } from './EstadoBadge'
import { EditarPedidoModal } from './EditarPedidoModal'

interface PedidoCardProps {
  pedido: PedidoResponse
  mostrarCliente?: boolean
  acciones?: { label: string; onClick: () => void; destacada?: boolean }[]
  onDocumentoActualizado?: () => void
}

const SIGUIENTE_ESTADO: Record<string, string> = {
  PENDIENTE: 'IMPRESO',
  IMPRESO: 'ENTREGADO',
}

const ACCION_SIGUIENTE_ESTADO: Record<string, string> = {
  PENDIENTE: 'Marcar impreso',
  IMPRESO: 'Marcar entregado',
}

const MOTIVOS_PRESET = [
  'Sin stock del producto pedido',
  'El precio cambió desde que se hizo el pedido',
  'El tipo de impresión pedido no está disponible',
  'Otro',
]

export function PedidoCard({ pedido, mostrarCliente, acciones, onDocumentoActualizado }: PedidoCardProps) {
  const [eligiendoMotivo, setEligiendoMotivo] = useState(false)
  const [motivoElegido, setMotivoElegido] = useState(MOTIVOS_PRESET[0])
  const [motivoCustom, setMotivoCustom] = useState('')
  const [guardandoMotivo, setGuardandoMotivo] = useState(false)
  const [editando, setEditando] = useState(false)

  async function handleAvanzarEstadoDoc(doc: DocumentoResponse) {
    const siguiente = SIGUIENTE_ESTADO[doc.estado]
    if (!siguiente) return
    await documentosApi.cambiarEstado(doc.id, siguiente)
    onDocumentoActualizado?.()
  }

  async function handleConfirmarRevision() {
    const motivo = motivoElegido === 'Otro' ? motivoCustom.trim() : motivoElegido
    if (!motivo) return
    setGuardandoMotivo(true)
    try {
      await pedidosApi.marcarEnRevision(pedido.id, motivo)
      setEligiendoMotivo(false)
      onDocumentoActualizado?.()
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'No se pudo poner el pedido en revisión')
    } finally {
      setGuardandoMotivo(false)
    }
  }

  const motivoParaMensaje = pedido.estado === 'EN_REVISION' && pedido.motivoRevision ? pedido.motivoRevision : null
  const mensajeContacto = motivoParaMensaje
    ? `Hola ${pedido.usuarioNombre}, te escribo por tu pedido #${pedido.id} en Bertinat Papelería: ${motivoParaMensaje}. ¿Cómo preferís que sigamos?`
    : `Hola ${pedido.usuarioNombre}, te escribo por tu pedido #${pedido.id} en Bertinat Papelería.`

  return (
    <div className={`order-card estado-${pedido.estado.toLowerCase()}`}>
      <div className="order-card-header">
        <div>
          <div className="order-card-title">Pedido #{pedido.id}</div>
          <div className="order-card-meta">
            {mostrarCliente && <>{pedido.usuarioNombre} · </>}
            {new Date(pedido.fechaPedido).toLocaleDateString()}
            {pedido.esEnvio && ' · Envío a domicilio'}
          </div>
        </div>
        <EstadoBadge estado={pedido.estado} />
      </div>

      {pedido.motivoRevision && pedido.estado === 'EN_REVISION' && (
        <p className="order-card-alerta">
          <strong>En revisión: </strong>
          {pedido.motivoRevision}
        </p>
      )}

      <ul className="order-card-items">
        {pedido.items.map((item) => {
          const precioCambio = mostrarCliente && Number(item.precioActual) !== Number(item.precioUnitario)
          return (
            <li key={item.id}>
              <span>
                {item.nombre}
                {item.ofertaTipo && ` (${item.ofertaTipo === 'SERVICIO' ? 'Servicio' : 'Oferta'})`} x{item.cantidad}
                {mostrarCliente && (
                  <span className="order-card-item-context">
                    {item.stockActual !== null && ` · stock actual: ${item.stockActual}`}
                    {precioCambio && ` · precio actual: $${item.precioActual} (era $${item.precioUnitario})`}
                  </span>
                )}
              </span>
              <span>${item.subtotal}</span>
            </li>
          )
        })}
      </ul>

      {pedido.descripcion && (
        <p style={{ margin: 0, fontSize: 12.5, color: 'var(--ink-soft)' }}>
          <strong>Detalle: </strong>
          {pedido.descripcion}
        </p>
      )}

      {mostrarCliente && (
        <div className="order-card-contacto">
          {pedido.usuarioTelefono && (
            <a
              className="secondary"
              href={linkWhatsapp(pedido.usuarioTelefono, mensajeContacto)}
              target="_blank"
              rel="noreferrer"
            >
              Escribir por WhatsApp
            </a>
          )}
          <a className="secondary" href={linkEmail(pedido.usuarioEmail, `Pedido #${pedido.id}`)}>
            Enviar email
          </a>
          {(pedido.estado === 'PENDIENTE' || pedido.estado === 'EN_REVISION') && (
            <button className="secondary" onClick={() => setEditando(true)}>
              Editar pedido
            </button>
          )}
          {pedido.estado === 'PENDIENTE' && !eligiendoMotivo && (
            <button className="secondary" onClick={() => setEligiendoMotivo(true)}>
              Poner en revisión
            </button>
          )}
        </div>
      )}

      {eligiendoMotivo && (
        <div className="order-card-revision-picker">
          {MOTIVOS_PRESET.map((motivo) => (
            <label key={motivo} className="checkbox-row">
              <input
                type="radio"
                name={`motivo-${pedido.id}`}
                checked={motivoElegido === motivo}
                onChange={() => setMotivoElegido(motivo)}
              />
              {motivo}
            </label>
          ))}
          {motivoElegido === 'Otro' && (
            <input
              placeholder="Describí el motivo…"
              value={motivoCustom}
              onChange={(e) => setMotivoCustom(e.target.value)}
            />
          )}
          <div className="order-card-doc-actions">
            <button onClick={handleConfirmarRevision} disabled={guardandoMotivo}>
              Confirmar
            </button>
            <button className="secondary" onClick={() => setEligiendoMotivo(false)} disabled={guardandoMotivo}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {pedido.documentos.length > 0 && (
        <ul className="order-card-items">
          {pedido.documentos.map((doc) => (
            <li key={doc.id}>
              <div>
                <div>
                  {doc.nombre} (Impresión) x{doc.cantidadCopias} <EstadoBadge estado={doc.estado} />
                </div>
                <div className="order-card-doc-actions">
                  <button className="secondary" onClick={() => documentosApi.descargar(doc)}>
                    Descargar
                  </button>
                  {mostrarCliente && SIGUIENTE_ESTADO[doc.estado] && (
                    <button onClick={() => handleAvanzarEstadoDoc(doc)}>{ACCION_SIGUIENTE_ESTADO[doc.estado]}</button>
                  )}
                </div>
              </div>
              <span>${doc.precio}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="order-card-total">
        <span>Total</span>
        <strong>${pedido.precio}</strong>
      </div>

      {acciones && acciones.length > 0 && (
        <div className="order-card-actions">
          {acciones.map((accion) => (
            <button key={accion.label} className={accion.destacada ? undefined : 'secondary'} onClick={accion.onClick}>
              {accion.label}
            </button>
          ))}
        </div>
      )}

      {editando && (
        <EditarPedidoModal
          pedido={pedido}
          onClose={() => setEditando(false)}
          onGuardado={() => onDocumentoActualizado?.()}
        />
      )}
    </div>
  )
}
