import { useEffect, useState, type FormEvent } from 'react'
import { cursosApi, type CursoEstudianteResponse, type CursoResponse } from '../../api/cursos'
import { usuariosApi } from '../../api/usuarios'
import type { UsuarioResponse } from '../../api/auth'
import { ApiError } from '../../api/client'
import { Modal } from '../../components/Modal'
import { PageHeader } from '../../components/PageHeader'

export function AdminCursosPage() {
  const [cursos, setCursos] = useState<CursoResponse[]>([])
  const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([])
  const [grado, setGrado] = useState('')
  const [grupo, setGrupo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [cursoSeleccionado, setCursoSeleccionado] = useState<CursoResponse | null>(null)
  const [estudiantes, setEstudiantes] = useState<CursoEstudianteResponse[]>([])
  const [estudianteId, setEstudianteId] = useState('')
  const [docenteId, setDocenteId] = useState('')
  const [materia, setMateria] = useState('')
  const [modalCursoAbierto, setModalCursoAbierto] = useState(false)

  const estudiantesDisponibles = usuarios.filter((u) => u.nivel === 'Estandar' && u.activo)
  const docentesDisponibles = usuarios.filter((u) => u.nivel === 'Docente' && u.activo)

  function cargarCursos() {
    cursosApi
      .listar()
      .then(setCursos)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los cursos'))
    usuariosApi.listar().then(setUsuarios).catch(() => {})
  }

  useEffect(cargarCursos, [])

  function cerrarModalCurso() {
    setModalCursoAbierto(false)
    setGrado('')
    setGrupo('')
    setError(null)
  }

  async function handleCrearCurso(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await cursosApi.crear(grado, grupo)
      cerrarModalCurso()
      cargarCursos()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear el curso')
    }
  }

  async function seleccionarCurso(curso: CursoResponse) {
    setCursoSeleccionado(curso)
    const lista = await cursosApi.listarEstudiantes(curso.id)
    setEstudiantes(lista)
  }

  function cerrarModalGestion() {
    setCursoSeleccionado(null)
    setEstudianteId('')
    setDocenteId('')
    setMateria('')
    setError(null)
  }

  async function handleAsignarEstudiante(e: FormEvent) {
    e.preventDefault()
    if (!cursoSeleccionado) return
    setError(null)
    try {
      await cursosApi.asignarEstudiante(cursoSeleccionado.id, Number(estudianteId))
      setEstudianteId('')
      seleccionarCurso(cursoSeleccionado)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo asignar el estudiante')
    }
  }

  async function handleAsignarDocente(e: FormEvent) {
    e.preventDefault()
    if (!cursoSeleccionado) return
    setError(null)
    try {
      await cursosApi.asignarDocente(cursoSeleccionado.id, Number(docenteId), materia)
      setDocenteId('')
      setMateria('')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo asignar el docente')
    }
  }

  return (
    <div>
      <PageHeader
        title="Cursos"
        subtitle="Grados y grupos, docentes y alumnos asociados"
        action={<button onClick={() => setModalCursoAbierto(true)}>+ Nuevo curso</button>}
      />
      {error && !modalCursoAbierto && !cursoSeleccionado && <p className="error">{error}</p>}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Grado</th>
              <th>Grupo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cursos.map((c) => (
              <tr key={c.id}>
                <td>{c.grado}</td>
                <td>{c.grupo}</td>
                <td>
                  <button className="secondary" onClick={() => seleccionarCurso(c)}>
                    Gestionar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalCursoAbierto && (
        <Modal title="Nuevo curso" onClose={cerrarModalCurso}>
          <form onSubmit={handleCrearCurso}>
            <label>
              Grado
              <input value={grado} onChange={(e) => setGrado(e.target.value)} required />
            </label>
            <label>
              Grupo
              <input value={grupo} onChange={(e) => setGrupo(e.target.value)} required />
            </label>
            {error && <p className="error">{error}</p>}
            <button type="submit">Crear curso</button>
          </form>
        </Modal>
      )}

      {cursoSeleccionado && (
        <Modal title={`Curso ${cursoSeleccionado.grado} ${cursoSeleccionado.grupo}`} onClose={cerrarModalGestion}>
          <h4>Estudiantes</h4>
          <ul>
            {estudiantes.map((e) => (
              <li key={e.id}>{e.estudianteNombre}</li>
            ))}
          </ul>
          <form onSubmit={handleAsignarEstudiante}>
            <label>
              Estudiante
              <select value={estudianteId} onChange={(e) => setEstudianteId(e.target.value)} required>
                <option value="">Seleccionar estudiante</option>
                {estudiantesDisponibles.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre} ({u.email})
                  </option>
                ))}
              </select>
            </label>
            <button type="submit">Asignar estudiante</button>
          </form>

          <h4>Docentes</h4>
          <form onSubmit={handleAsignarDocente}>
            <label>
              Docente
              <select value={docenteId} onChange={(e) => setDocenteId(e.target.value)} required>
                <option value="">Seleccionar docente</option>
                {docentesDisponibles.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre} ({u.email})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Materia
              <input value={materia} onChange={(e) => setMateria(e.target.value)} required />
            </label>
            {error && <p className="error">{error}</p>}
            <button type="submit">Asignar docente</button>
          </form>
        </Modal>
      )}
    </div>
  )
}
