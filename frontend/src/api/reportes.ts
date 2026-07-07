import { api } from './client'

export interface ProductoMasVendidoResponse {
  productoId: number
  productoNombre: string
  cantidadVendida: number
}

export interface UsuarioConteoResponse {
  usuarioId: number
  usuarioNombre: string
  cantidad: number
}

export interface UsuarioGastoResponse {
  usuarioId: number
  usuarioNombre: string
  totalGastado: string
}

export interface ResumenReporteResponse {
  ingresosTotales: string
  totalPedidos: number
  totalDocumentos: number
}

export const reportesApi = {
  resumen: (desde: string, hasta: string) =>
    api.get<ResumenReporteResponse>(`/reportes/resumen?desde=${desde}&hasta=${hasta}`),
  productosMasVendidos: (desde: string, hasta: string) =>
    api.get<ProductoMasVendidoResponse[]>(`/reportes/productos-mas-vendidos?desde=${desde}&hasta=${hasta}`),
  usuariosConMasGasto: (desde: string, hasta: string) =>
    api.get<UsuarioGastoResponse[]>(`/reportes/usuarios-mas-gasto?desde=${desde}&hasta=${hasta}`),
  usuariosConMasDocumentos: (desde: string, hasta: string) =>
    api.get<UsuarioConteoResponse[]>(`/reportes/usuarios-mas-documentos?desde=${desde}&hasta=${hasta}`),
}
