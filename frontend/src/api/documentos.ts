import { api, descargarArchivo } from './client'

export type ModoColor = 'BN' | 'COLOR_LASER' | 'COLOR_TINTA'
export type Tamanio = 'A4' | 'A3' | 'A5'
export type TipoPapel = '75g' | '160g' | '200g' | 'FOTO'
export type PaginasPorCara = '1' | '2' | '4'
export type Orientacion = 'VERTICAL' | 'HORIZONTAL'
export type Terminacion = 'NINGUNA' | 'ENCUADERNACION' | 'GRAPADO' | 'AGUJEROS'

export interface DocumentoResponse {
  id: number
  nombre: string
  formato: string | null
  esDobleFaz: boolean
  aColor: boolean
  descripcion: string | null
  esEnvio: boolean
  direccion: string | null
  cantidadCopias: number
  fechaIngreso: string
  activo: boolean
  nombreArchivoOriginal: string | null
  esImagen: boolean
  estado: 'PENDIENTE' | 'IMPRESO' | 'ENTREGADO'
  precio: string
  usuarioId: number
  usuarioNombre: string
  pedidoId: number | null
  tamanio: string | null
  tipoPapel: string | null
  modoColor: string | null
  paginasPorCara: string | null
  orientacion: string | null
  terminacion: string | null
}

export interface DocumentoFormData {
  nombre: string
  formato?: string | null
  esDobleFaz: boolean
  aColor: boolean
  descripcion?: string | null
  esEnvio: boolean
  direccion?: string | null
  cantidadCopias: number
  esImagen: boolean
  pedidoId: number
  archivo: File
  tamanio?: string
  tipoPapel?: string
  modoColor?: string
  paginasPorCara?: string
  orientacion?: string
  terminacion?: string
}

function construirFormData(data: DocumentoFormData): FormData {
  const formData = new FormData()
  formData.append('nombre', data.nombre)
  if (data.formato) formData.append('formato', data.formato)
  formData.append('esDobleFaz', String(data.esDobleFaz))
  formData.append('aColor', String(data.aColor))
  if (data.descripcion) formData.append('descripcion', data.descripcion)
  formData.append('esEnvio', String(data.esEnvio))
  if (data.direccion) formData.append('direccion', data.direccion)
  formData.append('cantidadCopias', String(data.cantidadCopias))
  formData.append('esImagen', String(data.esImagen))
  formData.append('pedidoId', String(data.pedidoId))
  if (data.tamanio) formData.append('tamanio', data.tamanio)
  if (data.tipoPapel) formData.append('tipoPapel', data.tipoPapel)
  if (data.modoColor) formData.append('modoColor', data.modoColor)
  if (data.paginasPorCara) formData.append('paginasPorCara', data.paginasPorCara)
  if (data.orientacion) formData.append('orientacion', data.orientacion)
  if (data.terminacion) formData.append('terminacion', data.terminacion)
  formData.append('archivo', data.archivo)
  return formData
}

export interface CotizarImpresionRequest {
  cantidadCopias: number
  modoColor: string
  tamanio: string
  tipoPapel: string
  terminacion: string
}

export const documentosApi = {
  crear: (data: DocumentoFormData) => api.postForm<DocumentoResponse>('/documentos', construirFormData(data)),
  cotizar: (data: CotizarImpresionRequest) =>
    api.post<{ precio: string }>('/documentos/cotizar', data),
  cambiarEstado: (id: number, estado: string) => api.put<DocumentoResponse>(`/documentos/${id}/estado`, { estado }),
  descargar: (doc: DocumentoResponse) =>
    descargarArchivo(`/documentos/${doc.id}/archivo`, doc.nombreArchivoOriginal ?? doc.nombre),
}
