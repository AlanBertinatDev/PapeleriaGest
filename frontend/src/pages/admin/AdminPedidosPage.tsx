import { useEffect, useMemo, useState } from 'react'
import { pedidosApi, type PedidoResponse } from '../../api/pedidos'
import { ApiError } from '../../api/client'
import { PedidoCard } from '../../components/PedidoCard'
import { FilterPills } from '../../components/FilterPills'
import { PageHeader } from '../../components/PageHeader'

type Filtro = 'TODOS' | 'PENDIENTE' | 'EN_REVISION' | 'LISTO' | 'ENTREGADO' | 'CANCELADO'

export function AdminPedidosPage() {
  const [pedidos, setPedidos] = useState<PedidoResponse[]>([])
  const [error, setError] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<Filtro>('PENDIENTE')
  const [busquedaCliente, setBusquedaCliente] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')

  function cargar() {
    pedidosApi
      .listarTodos()
      .then(setPedidos)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los pedidos'))
  }

  useEffect(cargar, [])

  async function handleCambiarEstado(id: number, estado: string) {
    setError(null)
    try {
      await pedidosApi.cambiarEstado(id, estado)
      cargar()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cambiar el estado')
    }
  }

  const opciones = useMemo(
    () => [
      { key: 'TODOS', label: 'Todos', count: pedidos.length },
      { key: 'PENDIENTE', label: 'Pendientes', count: pedidos.filter((p) => p.estado === 'PENDIENTE').length },
      {
        key: 'EN_REVISION',
        label: 'En revisión',
        count: pedidos.filter((p) => p.estado === 'EN_REVISION').length,
      },
      { key: 'LISTO', label: 'Listos', count: pedidos.filter((p) => p.estado === 'LISTO').length },
      { key: 'ENTREGADO', label: 'Entregados', count: pedidos.filter((p) => p.estado === 'ENTREGADO').length },
      { key: 'CANCELADO', label: 'Cancelados', count: pedidos.filter((p) => p.estado === 'CANCELADO').length },
    ],
    [pedidos],
  )

  const porEstado = filtro === 'TODOS' ? pedidos : pedidos.filter((p) => p.estado === filtro)
  const cliente = busquedaCliente.trim().toLowerCase()
  const porCliente = cliente ? porEstado.filter((p) => p.usuarioNombre.toLowerCase().includes(cliente)) : porEstado
  const desde = fechaDesde ? new Date(`${fechaDesde}T00:00:00`) : null
  const hasta = fechaHasta ? new Date(`${fechaHasta}T23:59:59`) : null
  const visibles = porCliente.filter((p) => {
    const fecha = new Date(p.fechaPedido)
    if (desde && fecha < desde) return false
    if (hasta && fecha > hasta) return false
    return true
  })
  const hayFiltroFecha = Boolean(fechaDesde || fechaHasta)

  return (
    <div>
      <PageHeader title="Pedidos" subtitle="Gestión de pedidos de clientes" />
      {error && <p className="error">{error}</p>}

      <FilterPills options={opciones} active={filtro} onChange={(k) => setFiltro(k as Filtro)} />

      <div className="order-toolbar">
        <div className="order-search-bar">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={busquedaCliente}
            onChange={(e) => setBusquedaCliente(e.target.value)}
            placeholder="Buscar por cliente…"
          />
        </div>
        <div className="order-date-filter">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M3 9h18M8 2v4M16 2v4" />
          </svg>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            aria-label="Desde"
          />
          <span>–</span>
          <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} aria-label="Hasta" />
          {hayFiltroFecha && (
            <button
              type="button"
              className="order-date-filter-clear"
              onClick={() => {
                setFechaDesde('')
                setFechaHasta('')
              }}
              aria-label="Limpiar filtro de fecha"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {visibles.length === 0 && (
        <p className="empty-state">
          {pedidos.length === 0
            ? 'No hay pedidos todavía.'
            : cliente || hayFiltroFecha
              ? 'No hay pedidos que coincidan con la búsqueda.'
              : 'No hay pedidos en este estado.'}
        </p>
      )}

      <div className="order-grid">
        {visibles.map((pedido) => {
          const acciones = []
          if (pedido.estado === 'PENDIENTE') {
            acciones.push({
              label: 'Marcar listo',
              destacada: true,
              onClick: () => handleCambiarEstado(pedido.id, 'LISTO'),
            })
            acciones.push({
              label: 'Cancelar',
              onClick: () => handleCambiarEstado(pedido.id, 'CANCELADO'),
            })
          } else if (pedido.estado === 'EN_REVISION') {
            acciones.push({
              label: 'Volver a pendiente',
              destacada: true,
              onClick: () => handleCambiarEstado(pedido.id, 'PENDIENTE'),
            })
            acciones.push({
              label: 'Cancelar',
              onClick: () => handleCambiarEstado(pedido.id, 'CANCELADO'),
            })
          } else if (pedido.estado === 'LISTO') {
            acciones.push({
              label: 'Marcar entregado',
              destacada: true,
              onClick: () => handleCambiarEstado(pedido.id, 'ENTREGADO'),
            })
            acciones.push({
              label: 'Cancelar',
              onClick: () => handleCambiarEstado(pedido.id, 'CANCELADO'),
            })
          } else if (pedido.estado === 'CANCELADO') {
            acciones.push({
              label: 'Reabrir como pendiente',
              onClick: () => handleCambiarEstado(pedido.id, 'PENDIENTE'),
            })
          }
          return (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              mostrarCliente
              acciones={acciones}
              onDocumentoActualizado={cargar}
            />
          )
        })}
      </div>
    </div>
  )
}
