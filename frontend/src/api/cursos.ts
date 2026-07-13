import { api } from './client'

export interface CursoResponse {
  id: number
  grado: string
  grupo: string
}

export interface CursoEstudianteResponse {
  id: number
  cursoId: number
  estudianteId: number
  estudianteNombre: string
}

export interface MateriaCursoDocenteResponse {
  id: number
  cursoId: number
  cursoNombre: string
  docenteId: number
  docenteNombre: string
  materia: string
}

export const cursosApi = {
  listar: () => api.get<CursoResponse[]>('/cursos'),
  misCursos: () => api.get<CursoResponse[]>('/cursos/mios'),
  crear: (grado: string, grupo: string) => api.post<CursoResponse>('/cursos', { grado, grupo }),
  asignarEstudiante: (cursoId: number, estudianteId: number) =>
    api.post<CursoEstudianteResponse>(`/cursos/${cursoId}/estudiantes`, { estudianteId }),
  listarEstudiantes: (cursoId: number) =>
    api.get<CursoEstudianteResponse[]>(`/cursos/${cursoId}/estudiantes`),
  asignarDocente: (cursoId: number, docenteId: number, materia: string) =>
    api.post<MateriaCursoDocenteResponse>(`/cursos/${cursoId}/docentes`, { docenteId, materia }),
  misAsignaciones: () => api.get<MateriaCursoDocenteResponse[]>('/cursos/mis-asignaciones'),
}
