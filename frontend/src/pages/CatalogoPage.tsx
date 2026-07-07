import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { productosApi, type ProductoResponse } from '../api/productos'
import { pedidosApi } from '../api/pedidos'
import { ApiError } from '../api/client'
import { PageHeader } from '../components/PageHeader'

export function CatalogoPage() {
  const [productos, setProductos] = useState<ProductoResponse[]>([])
  const [cantidades, setCantidades] = useState<Record<number, number>>({})
  const [error, setError] = useState<string | null>(null)
  const [creando, setCreando] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    productosApi
      .listar()
      .then(setProductos)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'No se pudo cargar el catálogo'))
  }, [])

  function setCantidad(codigo: number, cantidad: number) {
    setCantidades((prev) => ({ ...prev, [codigo]: cantidad }))
  }

  const total = productos.reduce((acc, p) => {
    const cantidad = cantidades[p.codigoProducto] ?? 0
    return acc + cantidad * Number(p.precioVenta)
  }, 0)

  async function handleCrearPedido() {
    const items = Object.entries(cantidades)
      .filter(([, cantidad]) => cantidad > 0)
      .map(([productoId, cantidad]) => ({ productoId: Number(productoId), cantidad }))

    if (items.length === 0) {
      setError('Agregá al menos un producto con cantidad mayor a 0')
      return
    }

    setError(null)
    setCreando(true)
    try {
      const pedido = await pedidosApi.crear({ esEnvio: false, items })
      navigate('/mis-pedidos', { state: { creado: pedido.id } })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear el pedido')
    } finally {
      setCreando(false)
    }
  }

  return (
    <div>
      <PageHeader title="Catálogo" subtitle="Elegí productos y cantidades para armar tu pedido" />
      {error && <p className="error">{error}</p>}
      {productos.length === 0 ? (
        <p className="empty-state">Todavía no hay productos cargados.</p>
      ) : (
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Producto</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.codigoProducto}>
              <td>{p.codigoProducto}</td>
              <td>
                {p.nombre} {p.stockBajo && <span className="badge badge-cancelado">Stock bajo</span>}
              </td>
              <td>${p.precioVenta}</td>
              <td>{p.cantidad}</td>
              <td>
                <input
                  type="number"
                  min={0}
                  max={p.cantidad}
                  style={{ width: '70px' }}
                  value={cantidades[p.codigoProducto] ?? 0}
                  onChange={(e) => setCantidad(p.codigoProducto, Number(e.target.value))}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      )}
      <div className="card" style={{ marginTop: 16 }}>
        <p>
          <strong>Total estimado:</strong> ${total.toFixed(2)}
        </p>
        <button onClick={handleCrearPedido} disabled={creando || productos.length === 0}>
          {creando ? 'Creando pedido...' : 'Crear pedido'}
        </button>
      </div>
    </div>
  )
}
