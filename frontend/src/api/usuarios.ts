import { api } from './client'
import type { UsuarioResponse } from './auth'

export interface NivelResponse {
  id: number
  nombre: string
}

export const usuariosApi = {
  listar: () => api.get<UsuarioResponse[]>('/usuarios'),
  listarNiveles: () => api.get<NivelResponse[]>('/usuarios/niveles'),
  cambiarNivel: (id: number, nivelId: number) => api.put<UsuarioResponse>(`/usuarios/${id}/nivel`, { nivelId }),
  activar: (id: number) => api.put<UsuarioResponse>(`/usuarios/${id}/activar`, undefined),
  desactivar: (id: number) => api.put<UsuarioResponse>(`/usuarios/${id}/desactivar`, undefined),
}
