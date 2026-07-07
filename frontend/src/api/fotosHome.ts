import { api } from './client'

export interface FotoHomeResponse {
  id: number
  fechaCarga: string
  usuarioNombre: string
}

export const fotosHomeApi = {
  listar: () => api.get<FotoHomeResponse[]>('/fotos-home'),
  subir: (archivo: File) => {
    const formData = new FormData()
    formData.append('archivo', archivo)
    return api.postForm<FotoHomeResponse>('/fotos-home', formData)
  },
  eliminar: (id: number) => api.delete<void>(`/fotos-home/${id}`),
}
