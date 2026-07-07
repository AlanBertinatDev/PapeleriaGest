import { useEffect, useMemo, useState } from 'react'
import { pedidosApi, type PedidoResponse } from '../api/pedidos'
import { ApiError } from '../api/client'
import { PedidoCard } from '../components/PedidoCard'
import { FilterPills } from '../components/FilterPills'
import { PageHeader } from '../components/PageHeader'

type Filtro = 'TODOS' | 'PENDIENTE' | 'ENTREGADO' | 'CANCELADO'

export function MisPedidosPage() {
  const [pedidos, setPedidos] = useState<PedidoResponse[]>([])
  const [error, setError] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<Filtro>('TODOS')

  function cargar() {
    pedidosApi
      .misPedidos()
      .then(setPedidos)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los pedidos'))
  }

  useEffect(cargar, [])

  async function handleCancelar(id: number) {
    setError(null)
    try {
      await pedidosApi.cancelar(id)
      cargar()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cancelar el pedido')
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
      <PageHeader title="Mis pedidos" subtitle="Seguimiento de tus compras en la papelería" />
      {error && <p className="error">{error}</p>}

      <FilterPills options={opciones} active={filtro} onChange={(k) => setFiltro(k as Filtro)} />

      {visibles.length === 0 && (
        <p className="empty-state">
          {pedidos.length === 0 ? 'Todavía no hiciste ningún pedido.' : 'No hay pedidos en este estado.'}
        </p>
      )}

      <div className="order-grid">
        {visibles.map((pedido) => (
          <PedidoCard
            key={pedido.id}
            pedido={pedido}
            acciones={
              pedido.estado === 'PENDIENTE'
                ? [{ label: 'Cancelar pedido', onClick: () => handleCancelar(pedido.id) }]
                : undefined
            }
          />
        ))}
      </div>
    </div>
  )
}
