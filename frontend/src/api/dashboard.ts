import { api } from './client'
import type { ProductoResponse } from './productos'

export interface DashboardResponse {
  pedidosPendientes: number
  documentosPendientes: number
  productosConStockBajo: ProductoResponse[]
}

export const dashboardApi = {
  obtener: () => api.get<DashboardResponse>('/admin/dashboard'),
}
