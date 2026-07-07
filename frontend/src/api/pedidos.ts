import { api } from './client'

export interface PedidoItemResponse {
  productoId: number
  productoNombre: string
  cantidad: number
  precioUnitario: string
  subtotal: string
}

export interface PedidoResponse {
  id: number
  fechaPedido: string
  fechaEntrega: string | null
  horaEntrega: string | null
  esEnvio: boolean
  direccion: string | null
  descripcion: string | null
  estado: 'PENDIENTE' | 'ENTREGADO' | 'CANCELADO'
  precio: string
  usuarioId: number
  usuarioNombre: string
  items: PedidoItemResponse[]
}

export interface PedidoItemRequest {
  productoId: number
  cantidad: number
}

export interface CrearPedidoRequest {
  fechaEntrega?: string | null
  horaEntrega?: string | null
  esEnvio: boolean
  direccion?: string | null
  descripcion?: string | null
  items: PedidoItemRequest[]
}

export const pedidosApi = {
  crear: (data: CrearPedidoRequest) => api.post<PedidoResponse>('/pedidos', data),
  misPedidos: () => api.get<PedidoResponse[]>('/pedidos/mios'),
  listarTodos: () => api.get<PedidoResponse[]>('/pedidos'),
  buscar: (id: number) => api.get<PedidoResponse>(`/pedidos/${id}`),
  cancelar: (id: number) => api.put<PedidoResponse>(`/pedidos/${id}/cancelar`, undefined),
  cambiarEstado: (id: number, estado: string) => api.put<PedidoResponse>(`/pedidos/${id}/estado`, { estado }),
}
