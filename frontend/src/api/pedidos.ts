import { api } from './client'
import type { DocumentoResponse } from './documentos'

export interface PedidoItemResponse {
  id: number
  productoId: number | null
  ofertaId: number | null
  ofertaTipo: 'PRODUCTO' | 'PACK' | 'SERVICIO' | null
  nombre: string
  cantidad: number
  precioUnitario: string
  subtotal: string
  stockActual: number | null
  precioActual: string
}

export interface PedidoResponse {
  id: number
  fechaPedido: string
  fechaEntrega: string | null
  horaEntrega: string | null
  esEnvio: boolean
  direccion: string | null
  descripcion: string | null
  estado: 'PENDIENTE' | 'EN_REVISION' | 'LISTO' | 'ENTREGADO' | 'CANCELADO'
  motivoRevision: string | null
  actualizadoEn: string | null
  precio: string
  usuarioId: number
  usuarioNombre: string
  usuarioEmail: string
  usuarioTelefono: string | null
  items: PedidoItemResponse[]
  documentos: DocumentoResponse[]
}

export interface TarifasResponse {
  costoEnvio: string
}

export interface PedidoItemRequest {
  productoId?: number | null
  ofertaId?: number | null
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
  tarifas: () => api.get<TarifasResponse>('/pedidos/tarifas'),
  misPedidos: () => api.get<PedidoResponse[]>('/pedidos/mios'),
  listarTodos: () => api.get<PedidoResponse[]>('/pedidos'),
  buscar: (id: number) => api.get<PedidoResponse>(`/pedidos/${id}`),
  cancelar: (id: number) => api.put<PedidoResponse>(`/pedidos/${id}/cancelar`, undefined),
  cambiarEstado: (id: number, estado: string) => api.put<PedidoResponse>(`/pedidos/${id}/estado`, { estado }),
  marcarEnRevision: (id: number, motivo: string) =>
    api.put<PedidoResponse>(`/pedidos/${id}/en-revision`, { motivo }),
  actualizarItems: (id: number, items: PedidoItemRequest[]) =>
    api.put<PedidoResponse>(`/pedidos/${id}/items`, { items }),
}
