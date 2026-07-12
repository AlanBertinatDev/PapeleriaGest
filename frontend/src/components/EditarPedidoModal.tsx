import { useEffect, useState } from 'react'
import { productosApi, type ProductoResponse } from '../api/productos'
import { pedidosApi, type PedidoItemRequest, type PedidoResponse } from '../api/pedidos'
import { ApiError } from '../api/client'
import { Modal } from './Modal'

interface Fila {
  key: string
  productoId: number | null
  ofertaId: number | null
  ofertaTipo: string | null
  nombre: string
  cantidad: number
  precioUnitario: number
}

export function EditarPedidoModal({
  pedido,
  onClose,
  onGuardado,
}: {
  pedido: PedidoResponse
  onClose: () => void
  onGuardado: () => void
}) {
  const [productos, setProductos] = useState<ProductoResponse[]>([])
  const [filas, setFilas] = useState<Fila[]>(
    pedido.items.map((item) => ({
      key: item.productoId ? `producto-${item.productoId}` : `oferta-${item.ofertaId}`,
      productoId: item.productoId,
      ofertaId: item.ofertaId,
      ofertaTipo: item.ofertaTipo,
      nombre: item.nombre,
      cantidad: item.cantidad,
      precioUnitario: Number(item.precioActual),
    })),
  )
  const [busqueda, setBusqueda] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    productosApi.listar().then(setProductos).catch(() => {})
  }, [])

  function cambiarCantidad(key: string, cantidad: number) {
    setFilas((prev) => prev.map((f) => (f.key === key ? { ...f, cantidad } : f)))
  }

  function quitarFila(key: string) {
    setFilas((prev) => prev.filter((f) => f.key !== key))
  }

  function agregarProducto(producto: ProductoResponse) {
    const key = `producto-${producto.codigoProducto}`
    setFilas((prev) => {
      const existente = prev.find((f) => f.key === key)
      if (existente) {
        return prev.map((f) => (f.key === key ? { ...f, cantidad: f.cantidad + 1 } : f))
      }
      return [
        ...prev,
        {
          key,
          productoId: producto.codigoProducto,
          ofertaId: null,
          ofertaTipo: null,
          nombre: producto.nombre,
          cantidad: 1,
          precioUnitario: Number(producto.precioVenta),
        },
      ]
    })
  }

  const total = filas.reduce((acc, f) => acc + f.cantidad * f.precioUnitario, 0)

  const resultadosBusqueda = busqueda.trim()
    ? productos.filter((p) => p.nombre.toLowerCase().includes(busqueda.trim().toLowerCase())).slice(0, 8)
    : []

  async function handleGuardar() {
    if (filas.length === 0) {
      setError('El pedido necesita al menos un ítem')
      return
    }
    setError(null)
    setGuardando(true)
    try {
      const items: PedidoItemRequest[] = filas.map((f) => ({
        productoId: f.productoId,
        ofertaId: f.ofertaId,
        cantidad: f.cantidad,
      }))
      await pedidosApi.actualizarItems(pedido.id, items)
      onGuardado()
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo actualizar el pedido')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal title={`Editar pedido #${pedido.id}`} onClose={onClose} wide>
      {error && <p className="error">{error}</p>}

      <ul className="order-card-items" style={{ marginBottom: 14 }}>
        {filas.map((fila) => (
          <li key={fila.key}>
            <span>
              {fila.nombre}
              {fila.ofertaTipo && ` (${fila.ofertaTipo === 'SERVICIO' ? 'Servicio' : 'Oferta'})`}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="number"
                min={1}
                value={fila.cantidad}
                onChange={(e) => cambiarCantidad(fila.key, Math.max(1, Number(e.target.value)))}
                style={{ width: 60, padding: '4px 6px' }}
              />
              <span>${(fila.cantidad * fila.precioUnitario).toFixed(2)}</span>
              <button className="secondary" onClick={() => quitarFila(fila.key)} style={{ padding: '4px 8px' }}>
                Quitar
              </button>
            </div>
          </li>
        ))}
        {filas.length === 0 && <li style={{ color: 'var(--ink-soft)' }}>Sin ítems</li>}
      </ul>

      <div className="order-card-total" style={{ marginBottom: 14 }}>
        <span>Total (sin envío)</span>
        <strong>${total.toFixed(2)}</strong>
      </div>

      <label>
        Agregar producto
        <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre…" />
      </label>

      {resultadosBusqueda.length > 0 && (
        <div className="checkbox-list">
          {resultadosBusqueda.map((p) => (
            <button
              key={p.codigoProducto}
              className="secondary"
              style={{ textAlign: 'left', marginBottom: 4, width: '100%' }}
              onClick={() => agregarProducto(p)}
            >
              {p.nombre} · ${p.precioVenta} · stock {p.cantidad}
            </button>
          ))}
        </div>
      )}

      <div className="order-card-actions" style={{ marginTop: 14 }}>
        <button onClick={handleGuardar} disabled={guardando}>
          Guardar cambios
        </button>
        <button className="secondary" onClick={onClose} disabled={guardando}>
          Cancelar
        </button>
      </div>
    </Modal>
  )
}
