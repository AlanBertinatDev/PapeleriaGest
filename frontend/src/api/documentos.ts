import { api, descargarArchivo } from './client'

export interface DocumentoResponse {
  id: number
  nombre: string
  formato: string | null
  esDobleFaz: boolean
  aColor: boolean
  descripcion: string | null
  esEnvio: boolean
  direccion: string | null
  materia: string | null
  cantidadCopias: number
  esPractico: boolean
  nroPractico: number
  fechaIngreso: string
  activo: boolean
  nombreArchivoOriginal: string | null
  esImagen: boolean
  estado: 'PENDIENTE' | 'IMPRESO' | 'ENTREGADO'
  usuarioId: number
  usuarioNombre: string
  pedidoId: number | null
  cursoId: number | null
  cursoNombre: string | null
}

export interface DocumentoFormData {
  nombre: string
  formato?: string | null
  esDobleFaz: boolean
  aColor: boolean
  descripcion?: string | null
  esEnvio: boolean
  direccion?: string | null
  materia?: string | null
  cantidadCopias: number
  esPractico: boolean
  nroPractico: number
  esImagen: boolean
  pedidoId?: number | null
  cursoId?: number | null
  archivo: File
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
  if (data.materia) formData.append('materia', data.materia)
  formData.append('cantidadCopias', String(data.cantidadCopias))
  formData.append('esPractico', String(data.esPractico))
  formData.append('nroPractico', String(data.nroPractico))
  formData.append('esImagen', String(data.esImagen))
  if (data.pedidoId != null) formData.append('pedidoId', String(data.pedidoId))
  if (data.cursoId != null) formData.append('cursoId', String(data.cursoId))
  formData.append('archivo', data.archivo)
  return formData
}

export const documentosApi = {
  crear: (data: DocumentoFormData) => api.postForm<DocumentoResponse>('/documentos', construirFormData(data)),
  misDocumentos: () => api.get<DocumentoResponse[]>('/documentos/mios'),
  listarTodos: () => api.get<DocumentoResponse[]>('/documentos'),
  listarPorCurso: (cursoId: number) => api.get<DocumentoResponse[]>(`/documentos/por-curso/${cursoId}`),
  cambiarEstado: (id: number, estado: string) => api.put<DocumentoResponse>(`/documentos/${id}/estado`, { estado }),
  eliminar: (id: number) => api.delete<void>(`/documentos/${id}`),
  descargar: (doc: DocumentoResponse) =>
    descargarArchivo(`/documentos/${doc.id}/archivo`, doc.nombreArchivoOriginal ?? doc.nombre),
}
