import { api } from './client'

export interface CategoriaProductoResponse {
  id: number
  nombre: string
  porcentaje: number
}

export interface MarcaResponse {
  id: number
  nombre: string
}

export interface ProductoResponse {
  codigoProducto: number
  nombre: string
  precioVenta: string
  precioCompra: string
  activo: boolean
  categoria: CategoriaProductoResponse
  marca: MarcaResponse | null
  cantidad: number
  unidadMedida: string | null
  fechaCarga: string
  iva: string | null
  stockMinimo: number
  stockBajo: boolean
  tieneImagen: boolean
}

export interface ProductoRequest {
  codigoProducto: number
  nombre: string
  precioVenta: string
  precioCompra: string
  categoriaId: number
  marcaId: number | null
  cantidad: number
  unidadMedida: string | null
  iva: string | null
  stockMinimo: number
}

export const productosApi = {
  listar: (categoriaId?: number) =>
    api.get<ProductoResponse[]>(categoriaId ? `/productos?categoriaId=${categoriaId}` : '/productos'),
  listarInactivos: () => api.get<ProductoResponse[]>('/productos/inactivos'),
  buscar: (codigo: number) => api.get<ProductoResponse>(`/productos/${codigo}`),
  crear: (data: ProductoRequest) => api.post<ProductoResponse>('/productos', data),
  actualizar: (codigo: number, data: ProductoRequest) => api.put<ProductoResponse>(`/productos/${codigo}`, data),
  desactivar: (codigo: number) => api.delete<void>(`/productos/${codigo}`),
  reactivar: (codigo: number) => api.put<ProductoResponse>(`/productos/${codigo}/reactivar`, undefined),
  reponerStock: (codigo: number, cantidad: number) =>
    api.put<ProductoResponse>(`/productos/${codigo}/reponer-stock`, { cantidad }),
  subirImagen: (codigo: number, archivo: File) => {
    const formData = new FormData()
    formData.append('archivo', archivo)
    return api.postForm<ProductoResponse>(`/productos/${codigo}/imagen`, formData)
  },
}

export const categoriasApi = {
  listar: () => api.get<CategoriaProductoResponse[]>('/categorias'),
  crear: (nombre: string, porcentaje: number) =>
    api.post<CategoriaProductoResponse>('/categorias', { nombre, porcentaje }),
}

export const marcasApi = {
  listar: () => api.get<MarcaResponse[]>('/marcas'),
  crear: (nombre: string) => api.post<MarcaResponse>('/marcas', { nombre }),
}
