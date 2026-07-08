import { documentosApi, type DocumentoResponse } from '../api/documentos'
import type { PedidoResponse } from '../api/pedidos'
import { EstadoBadge } from './EstadoBadge'

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

export function PedidoCard({ pedido, mostrarCliente, acciones, onDocumentoActualizado }: PedidoCardProps) {
  async function handleAvanzarEstadoDoc(doc: DocumentoResponse) {
    const siguiente = SIGUIENTE_ESTADO[doc.estado]
    if (!siguiente) return
    await documentosApi.cambiarEstado(doc.id, siguiente)
    onDocumentoActualizado?.()
  }

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

      <ul className="order-card-items">
        {pedido.items.map((item) => (
          <li key={item.id}>
            <span>
              {item.nombre}
              {item.ofertaTipo && ` (${item.ofertaTipo === 'SERVICIO' ? 'Servicio' : 'Oferta'})`} x{item.cantidad}
            </span>
            <span>${item.subtotal}</span>
          </li>
        ))}
      </ul>

      {pedido.descripcion && (
        <p style={{ margin: 0, fontSize: 12.5, color: 'var(--ink-soft)' }}>
          <strong>Detalle: </strong>
          {pedido.descripcion}
        </p>
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
    </div>
  )
}
