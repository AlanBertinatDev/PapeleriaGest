import { api } from './client'

export interface ConfiguracionResponse {
  id: number
  nombre: string
  valor: string | null
}

export const configuracionesApi = {
  listar: () => api.get<ConfiguracionResponse[]>('/configuraciones'),
  upsert: (nombre: string, valor: string) =>
    api.put<ConfiguracionResponse>('/configuraciones', { nombre, valor }),
  eliminar: (id: number) => api.delete<void>(`/configuraciones/${id}`),
}
