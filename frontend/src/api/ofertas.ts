import { api } from './client'
import type { ProductoResponse } from './productos'

export interface OfertaResponse {
  id: number
  titulo: string
  descripcion: string | null
  precio: string
  fechaDesde: string
  fechaHasta: string
  activo: boolean
  usuarioId: number
  usuarioNombre: string
  imagenesUrls: string[]
  productos: ProductoResponse[]
}

export interface OfertaRequest {
  titulo: string
  descripcion?: string | null
  precio: string
  fechaDesde: string
  fechaHasta: string
  imagenesUrls: string[]
  productoIds: number[]
}

export const ofertasApi = {
  listarVigentes: () => api.get<OfertaResponse[]>('/ofertas'),
  listarTodas: () => api.get<OfertaResponse[]>('/ofertas/todas'),
  crear: (data: OfertaRequest) => api.post<OfertaResponse>('/ofertas', data),
  eliminar: (id: number) => api.delete<void>(`/ofertas/${id}`),
}
