import { useEffect, useState, type FormEvent } from 'react'
import {
  reportesApi,
  type ProductoMasVendidoResponse,
  type ResumenReporteResponse,
  type UsuarioConteoResponse,
  type UsuarioGastoResponse,
} from '../../api/reportes'
import { ApiError } from '../../api/client'
import { RankingBars } from '../../components/RankingBars'
import { PageHeader } from '../../components/PageHeader'
import { FilterPills } from '../../components/FilterPills'
import styles from './AdminReportesPage.module.css'

type Preset = '7d' | '30d' | 'mes' | 'custom'

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function rangoPara(preset: Preset): { desde: string; hasta: string } {
  const hasta = new Date()
  const desde = new Date()
  if (preset === '7d') desde.setDate(desde.getDate() - 7)
  else if (preset === '30d') desde.setDate(desde.getDate() - 30)
  else if (preset === 'mes') desde.setDate(1)
  return { desde: formatDate(desde), hasta: formatDate(hasta) }
}

export function AdminReportesPage() {
  const [preset, setPreset] = useState<Preset>('30d')
  const [desde, setDesde] = useState(rangoPara('30d').desde)
  const [hasta, setHasta] = useState(rangoPara('30d').hasta)
  const [resumen, setResumen] = useState<ResumenReporteResponse | null>(null)
  const [productos, setProductos] = useState<ProductoMasVendidoResponse[]>([])
  const [usuariosGasto, setUsuariosGasto] = useState<UsuarioGastoResponse[]>([])
  const [usuariosDocumentos, setUsuariosDocumentos] = useState<UsuarioConteoResponse[]>([])
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  async function generar(rangoDesde: string, rangoHasta: string) {
    setError(null)
    setCargando(true)
    try {
      const [r, p, ug, ud] = await Promise.all([
        reportesApi.resumen(rangoDesde, rangoHasta),
        reportesApi.productosMasVendidos(rangoDesde, rangoHasta),
        reportesApi.usuariosConMasGasto(rangoDesde, rangoHasta),
        reportesApi.usuariosConMasDocumentos(rangoDesde, rangoHasta),
      ])
      setResumen(r)
      setProductos(p)
      setUsuariosGasto(ug)
      setUsuariosDocumentos(ud)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron generar los reportes')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    generar(desde, hasta)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function aplicarPreset(nuevo: Preset) {
    setPreset(nuevo)
    const rango = rangoPara(nuevo)
    setDesde(rango.desde)
    setHasta(rango.hasta)
    generar(rango.desde, rango.hasta)
  }

  function handleFechaManual(campo: 'desde' | 'hasta', valor: string) {
    setPreset('custom')
    if (campo === 'desde') setDesde(valor)
    else setHasta(valor)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    generar(desde, hasta)
  }

  return (
    <div>
      <PageHeader title="Reportes" subtitle="Ventas e impresión en el rango de fechas elegido" />

      <form className={styles.filtersForm} onSubmit={handleSubmit}>
        <FilterPills
          className={styles.noMargin}
          options={[
            { key: '7d', label: 'Últimos 7 días' },
            { key: '30d', label: 'Últimos 30 días' },
            { key: 'mes', label: 'Este mes' },
          ]}
          active={preset}
          onChange={(key) => aplicarPreset(key as Preset)}
        />
        <label>
          Desde
          <input type="date" value={desde} onChange={(e) => handleFechaManual('desde', e.target.value)} required />
        </label>
        <label>
          Hasta
          <input type="date" value={hasta} onChange={(e) => handleFechaManual('hasta', e.target.value)} required />
        </label>
        <button type="submit" disabled={cargando} style={{ marginLeft: 'auto' }}>
          {cargando ? 'Actualizando...' : 'Actualizar'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}

      {resumen && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-value">${resumen.ingresosTotales}</div>
            <div className="stat-label">Ingresos en el período</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{resumen.totalPedidos}</div>
            <div className="stat-label">Pedidos realizados</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{resumen.totalDocumentos}</div>
            <div className="stat-label">Documentos cargados</div>
          </div>
        </div>
      )}

      <div className="card">
        <h3>Top 5 productos más vendidos</h3>
        <RankingBars
          color="menta"
          emptyMessage="No hubo ventas de productos en este período."
          items={productos.map((p) => ({
            key: p.productoId,
            label: p.productoNombre,
            value: p.cantidadVendida,
            displayValue: `${p.cantidadVendida} unid.`,
          }))}
        />
      </div>

      <div className="card">
        <h3>Top 5 clientes por gasto</h3>
        <RankingBars
          color="celeste"
          emptyMessage="No hubo compras en este período."
          items={usuariosGasto.map((u) => ({
            key: u.usuarioId,
            label: u.usuarioNombre,
            value: Number(u.totalGastado),
            displayValue: `$${u.totalGastado}`,
          }))}
        />
      </div>

      <div className="card">
        <h3>Top 5 usuarios con más documentos</h3>
        <RankingBars
          emptyMessage="No hubo documentos cargados en este período."
          items={usuariosDocumentos.map((u) => ({
            key: u.usuarioId,
            label: u.usuarioNombre,
            value: u.cantidad,
            displayValue: `${u.cantidad}`,
          }))}
        />
      </div>
    </div>
  )
}
