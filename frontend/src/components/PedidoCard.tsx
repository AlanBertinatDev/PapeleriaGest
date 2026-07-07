import type { PedidoResponse } from '../api/pedidos'
import { EstadoBadge } from './EstadoBadge'

interface PedidoCardProps {
  pedido: PedidoResponse
  mostrarCliente?: boolean
  acciones?: { label: string; onClick: () => void; destacada?: boolean }[]
}

export function PedidoCard({ pedido, mostrarCliente, acciones }: PedidoCardProps) {
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

      {pedido.documentos.length > 0 && (
        <ul className="order-card-items">
          {pedido.documentos.map((doc) => (
            <li key={doc.id}>
              <span>
                {doc.nombre} (Impresión) x{doc.cantidadCopias}
              </span>
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
