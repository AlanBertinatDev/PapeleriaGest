import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { dashboardApi, type DashboardResponse } from '../../api/dashboard'
import { reportesApi, type ProductoMasVendidoResponse, type ResumenReporteResponse } from '../../api/reportes'
import { ApiError } from '../../api/client'
import { RankingBars } from '../../components/RankingBars'

function hace30Dias(): { desde: string; hasta: string } {
  const hasta = new Date()
  const desde = new Date()
  desde.setDate(desde.getDate() - 30)
  return { desde: desde.toISOString().slice(0, 10), hasta: hasta.toISOString().slice(0, 10) }
}

export function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [resumen, setResumen] = useState<ResumenReporteResponse | null>(null)
  const [productos, setProductos] = useState<ProductoMasVendidoResponse[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    dashboardApi
      .obtener()
      .then(setDashboard)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'No se pudo cargar el panel'))

    const { desde, hasta } = hace30Dias()
    reportesApi.resumen(desde, hasta).then(setResumen).catch(() => {})
    reportesApi.productosMasVendidos(desde, hasta).then(setProductos).catch(() => {})
  }, [])

  return (
    <div>
      <div className="page-hero">
        <h1>Inicio</h1>
        <p>Resumen del día a día de la papelería</p>
      </div>
      {error && <p className="error">{error}</p>}
      {dashboard && (
        <>
          <div className="stat-grid">
            <Link to="/admin/pedidos" className="stat-card warn" style={{ textDecoration: 'none' }}>
              <div className="stat-value">{dashboard.pedidosPendientes}</div>
              <div className="stat-label">Pedidos pendientes</div>
            </Link>
            <Link to="/admin/documentos" className="stat-card warn" style={{ textDecoration: 'none' }}>
              <div className="stat-value">{dashboard.documentosPendientes}</div>
              <div className="stat-label">Documentos por imprimir</div>
            </Link>
            <Link to="/admin/productos" className="stat-card danger" style={{ textDecoration: 'none' }}>
              <div className="stat-value">{dashboard.productosConStockBajo.length}</div>
              <div className="stat-label">Productos con stock bajo</div>
            </Link>
            {resumen && (
              <Link to="/admin/reportes" className="stat-card" style={{ textDecoration: 'none' }}>
                <div className="stat-value">${resumen.ingresosTotales}</div>
                <div className="stat-label">Ingresos (últimos 30 días)</div>
              </Link>
            )}
          </div>

          <div className="card">
            <h3>Top 5 productos más vendidos (últimos 30 días)</h3>
            <RankingBars
              emptyMessage="No hubo ventas de productos en los últimos 30 días."
              items={productos.map((p) => ({
                key: p.productoId,
                label: p.productoNombre,
                value: p.cantidadVendida,
                displayValue: `${p.cantidadVendida} unid.`,
              }))}
            />
            <p style={{ marginTop: 10 }}>
              <Link to="/admin/reportes">Ver reportes completos →</Link>
            </p>
          </div>

          <div className="card">
            <h3>Productos con stock bajo</h3>
            {dashboard.productosConStockBajo.length === 0 ? (
              <p className="empty-state">No hay productos con stock bajo.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Producto</th>
                    <th>Stock</th>
                    <th>Mínimo</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.productosConStockBajo.map((p) => (
                    <tr key={p.codigoProducto}>
                      <td>{p.codigoProducto}</td>
                      <td>{p.nombre}</td>
                      <td>{p.cantidad}</td>
                      <td>{p.stockMinimo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}
