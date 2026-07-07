import { api } from './client'

export interface NotificacionResponse {
  id: number
  usuarioId: number
  nombreUsuario: string
  accionUsuario: string
  tipoNotificacion: string
  fecha: string
  documentoId: number | null
  leida: boolean
}

export const notificacionesApi = {
  noLeidas: () => api.get<NotificacionResponse[]>('/notificaciones/no-leidas'),
  marcarLeida: (id: number) => api.put<void>(`/notificaciones/${id}/leida`),
  marcarTodasLeidas: () => api.put<void>('/notificaciones/leer-todas'),
}

export function rutaDeNotificacion(n: NotificacionResponse): string {
  return n.tipoNotificacion === 'Notificaciones Documentos' ? '/admin/documentos' : '/admin/pedidos'
}
