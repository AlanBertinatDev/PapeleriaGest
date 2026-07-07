import { api } from './client'
import type { ProductoResponse } from './productos'

export type TipoOferta = 'PRODUCTO' | 'PACK' | 'SERVICIO'
export type AudienciaNotificacion = 'TODOS' | 'CATEGORIA'

export interface OfertaResponse {
  id: number
  titulo: string
  descripcion: string | null
  precio: string
  fechaDesde: string
  fechaHasta: string
  activo: boolean
  tipo: TipoOferta
  tieneImagen: boolean
  usuarioId: number
  usuarioNombre: string
  notificado: boolean
  notificadoCantidad: number | null
  audienciaNotificacion: AudienciaNotificacion | null
  destacarHome: boolean
  productos: ProductoResponse[]
}

export interface OfertaRequest {
  titulo: string
  descripcion?: string | null
  precio: string
  fechaDesde: string
  fechaHasta: string
  tipo: TipoOferta
  productoIds: number[]
  notificarPorCorreo: boolean
  audienciaNotificacion: AudienciaNotificacion | null
  destacarHome: boolean
}

export const ofertasApi = {
  listarVigentes: () => api.get<OfertaResponse[]>('/ofertas'),
  listarTodas: () => api.get<OfertaResponse[]>('/ofertas/todas'),
  crear: (data: OfertaRequest) => api.post<OfertaResponse>('/ofertas', data),
  actualizar: (id: number, data: OfertaRequest) => api.put<OfertaResponse>(`/ofertas/${id}`, data),
  eliminar: (id: number) => api.delete<void>(`/ofertas/${id}`),
  subirImagen: (id: number, archivo: File) => {
    const formData = new FormData()
    formData.append('archivo', archivo)
    return api.postForm<OfertaResponse>(`/ofertas/${id}/imagen`, formData)
  },
}
