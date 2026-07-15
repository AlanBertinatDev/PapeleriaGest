import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { cursosApi, type MateriaCursoDocenteResponse } from '../../api/cursos'
import { documentosApi, type DocumentoResponse } from '../../api/documentos'
import { useAuth } from '../../auth/AuthContext'
import { ApiError } from '../../api/client'
import { Modal } from '../../components/Modal'
import { DocumentoCard } from '../../components/DocumentoCard'
import { PageHeader } from '../../components/PageHeader'

export function CargarMaterialPage() {
  const { usuario } = useAuth()
  const [asignaciones, setAsignaciones] = useState<MateriaCursoDocenteResponse[]>([])
  const [misMateriales, setMisMateriales] = useState<DocumentoResponse[]>([])
  const [nombre, setNombre] = useState('')
  const [asignacionId, setAsignacionId] = useState('')
  const [codigo, setCodigo] = useState('')
  const [archivo, setArchivo] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [creando, setCreando] = useState(false)
  const [modalAbierto, setModalAbierto] = useState(false)

  function cargar() {
    cursosApi.misAsignaciones().then(setAsignaciones).catch(() => {})
    documentosApi
      .misDocumentos()
      .then((docs) => setMisMateriales(docs.filter((d) => d.cursoId !== null)))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'No se pudieron cargar tus materiales'))
  }

  useEffect(cargar, [])

  const materialesPorCurso = useMemo(() => {
    const grupos = new Map<string, DocumentoResponse[]>()
    for (const doc of misMateriales) {
      const clave = doc.cursoNombre ?? 'Sin curso específico'
      if (!grupos.has(clave)) grupos.set(clave, [])
      grupos.get(clave)!.push(doc)
    }
    return Array.from(grupos.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [misMateriales])

  function cerrarModal() {
    setModalAbierto(false)
    setNombre('')
    setAsignacionId('')
    setCodigo('')
    setArchivo(null)
    setError(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!archivo) {
      setError('Adjuntá un archivo')
      return
    }
    const asignacion = asignaciones.find((a) => String(a.id) === asignacionId)
    if (!asignacion) {
      setError('Elegí el curso y materia')
      return
    }
    setError(null)
    setCreando(true)
    try {
      await documentosApi.crear({
        nombre,
        materia: asignacion.materia,
        cursoId: asignacion.cursoId,
        codigo: codigo || null,
        cantidadCopias: 1,
        esDobleFaz: false,
        aColor: false,
        archivo,
        esEnvio: false,
        esPractico: false,
        nroPractico: 0,
        esImagen: false,
      })
      cerrarModal()
      cargar()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cargar el material')
    } finally {
      setCreando(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Cargar material"
        subtitle={`Hola ${usuario?.nombre}: subí el material del curso para que los alumnos lo pidan a imprimir`}
      />

      {asignaciones.length === 0 && (
        <p className="empty-state">
          Todavía no tenés cursos y materias asignados. Pedile al administrador que te asigne alguno.
        </p>
      )}

      {asignaciones.length > 0 && (
        <div className="section-header">
          <h3>Materiales que cargaste</h3>
          <button onClick={() => setModalAbierto(true)}>Cargar material</button>
        </div>
      )}
      {error && !modalAbierto && <p className="error">{error}</p>}

      {asignaciones.length > 0 && misMateriales.length === 0 && (
        <p className="empty-state">Todavía no cargaste materiales de curso.</p>
      )}

      {materialesPorCurso.map(([curso, docs]) => (
        <div key={curso} style={{ marginBottom: 24 }}>
          <h4 style={{ margin: '0 0 8px' }}>{curso}</h4>
          <div className="order-grid">
            {docs.map((doc) => (
              <DocumentoCard key={doc.id} documento={doc} />
            ))}
          </div>
        </div>
      ))}

      {modalAbierto && (
        <Modal title="Nuevo material" onClose={cerrarModal}>
          <form onSubmit={handleSubmit}>
            <label>
              Nombre del material
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Guía de ejercicios 4" required />
            </label>
            <label>
              Curso y materia
              <select value={asignacionId} onChange={(e) => setAsignacionId(e.target.value)} required>
                <option value="">Seleccionar curso y materia</option>
                {asignaciones.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.cursoNombre} — {a.materia}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Código (opcional)
              <input
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Ej: PARCIAL1 — si lo dejás vacío se genera uno"
              />
            </label>
            <label>
              Archivo
              <input type="file" onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} required />
            </label>
            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={creando}>
              {creando ? 'Cargando...' : 'Cargar material'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
