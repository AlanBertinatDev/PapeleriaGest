import { useEffect, useMemo, useState } from 'react'
import { pedidosApi, type PedidoResponse } from '../../api/pedidos'
import { ApiError } from '../../api/client'
import { PedidoCard } from '../../components/PedidoCard'
import { FilterPills } from '../../components/FilterPills'

type Filtro = 'TODOS' | 'PENDIENTE' | 'ENTREGADO' | 'CANCELADO'

export function AdminPedidosPage() {
  const [pedidos, setPedidos] = useState<PedidoResponse[]>([])
  const [error, setError] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<Filtro>('PENDIENTE')

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
      { key: 'ENTREGADO', label: 'Entregados', count: pedidos.filter((p) => p.estado === 'ENTREGADO').length },
      { key: 'CANCELADO', label: 'Cancelados', count: pedidos.filter((p) => p.estado === 'CANCELADO').length },
    ],
    [pedidos],
  )

  const visibles = filtro === 'TODOS' ? pedidos : pedidos.filter((p) => p.estado === filtro)

  return (
    <div>
      <div className="page-hero">
        <h1>Pedidos</h1>
        <p>Gestión de pedidos de clientes</p>
      </div>
      {error && <p className="error">{error}</p>}

      <FilterPills options={opciones} active={filtro} onChange={(k) => setFiltro(k as Filtro)} />

      {visibles.length === 0 && (
        <p className="empty-state">
          {pedidos.length === 0 ? 'No hay pedidos todavía.' : 'No hay pedidos en este estado.'}
        </p>
      )}

      <div className="order-grid">
        {visibles.map((pedido) => {
          const acciones = []
          if (pedido.estado === 'PENDIENTE') {
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
          return <PedidoCard key={pedido.id} pedido={pedido} mostrarCliente acciones={acciones} />
        })}
      </div>
    </div>
  )
}
