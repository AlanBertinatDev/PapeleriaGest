import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { cursosApi, type CursoResponse } from '../../api/cursos'
import { documentosApi, type DocumentoResponse } from '../../api/documentos'
import { useAuth } from '../../auth/AuthContext'
import { ApiError } from '../../api/client'
import { Modal } from '../../components/Modal'
import { DocumentoCard } from '../../components/DocumentoCard'
import { FilterPills } from '../../components/FilterPills'
import { PageHeader } from '../../components/PageHeader'

type Filtro = 'TODOS' | 'PENDIENTE' | 'IMPRESO' | 'ENTREGADO'

export function CargarMaterialPage() {
  const { usuario } = useAuth()
  const [cursos, setCursos] = useState<CursoResponse[]>([])
  const [misMateriales, setMisMateriales] = useState<DocumentoResponse[]>([])
  const [nombre, setNombre] = useState('')
  const [materia, setMateria] = useState('')
  const [cursoId, setCursoId] = useState('')
  const [cantidadCopias, setCantidadCopias] = useState(1)
  const [esDobleFaz, setEsDobleFaz] = useState(false)
  const [aColor, setAColor] = useState(false)
  const [archivo, setArchivo] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [creando, setCreando] = useState(false)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [filtro, setFiltro] = useState<Filtro>('TODOS')

  function cargar() {
    cursosApi.listar().then(setCursos).catch(() => {})
    documentosApi
      .misDocumentos()
      .then((docs) => setMisMateriales(docs.filter((d) => d.cursoId !== null)))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'No se pudieron cargar tus materiales'))
  }

  useEffect(cargar, [])

  function cerrarModal() {
    setModalAbierto(false)
    setNombre('')
    setMateria('')
    setCursoId('')
    setCantidadCopias(1)
    setEsDobleFaz(false)
    setAColor(false)
    setArchivo(null)
    setError(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!archivo) {
      setError('Adjuntá un archivo')
      return
    }
    setError(null)
    setCreando(true)
    try {
      await documentosApi.crear({
        nombre,
        materia: materia || null,
        cursoId: cursoId ? Number(cursoId) : null,
        cantidadCopias,
        esDobleFaz,
        aColor,
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

  const opciones = useMemo(
    () => [
      { key: 'TODOS', label: 'Todos', count: misMateriales.length },
      { key: 'PENDIENTE', label: 'Pendientes', count: misMateriales.filter((d) => d.estado === 'PENDIENTE').length },
      { key: 'IMPRESO', label: 'Impresos', count: misMateriales.filter((d) => d.estado === 'IMPRESO').length },
      { key: 'ENTREGADO', label: 'Entregados', count: misMateriales.filter((d) => d.estado === 'ENTREGADO').length },
    ],
    [misMateriales],
  )

  const visibles = filtro === 'TODOS' ? misMateriales : misMateriales.filter((d) => d.estado === filtro)

  return (
    <div>
      <PageHeader
        title="Cargar material"
        subtitle={`Hola ${usuario?.nombre}: subí el material del curso y las instrucciones de copiado para que la papelería lo prepare`}
      />

      <div className="section-header">
        <h3>Materiales que cargaste</h3>
        <button onClick={() => setModalAbierto(true)}>Cargar material</button>
      </div>
      {error && !modalAbierto && <p className="error">{error}</p>}

      <FilterPills options={opciones} active={filtro} onChange={(k) => setFiltro(k as Filtro)} />

      {visibles.length === 0 && (
        <p className="empty-state">
          {misMateriales.length === 0 ? 'Todavía no cargaste materiales de curso.' : 'No hay materiales en este estado.'}
        </p>
      )}

      <div className="order-grid">
        {visibles.map((doc) => (
          <DocumentoCard key={doc.id} documento={doc} />
        ))}
      </div>

      {modalAbierto && (
        <Modal title="Nuevo material" onClose={cerrarModal}>
          <form onSubmit={handleSubmit}>
            <label>
              Nombre del material
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Guía de ejercicios 4" required />
            </label>
            <label>
              Materia (opcional)
              <input value={materia} onChange={(e) => setMateria(e.target.value)} placeholder="Matemática" />
            </label>
            <label>
              Curso destinatario
              <select value={cursoId} onChange={(e) => setCursoId(e.target.value)}>
                <option value="">Sin curso específico</option>
                {cursos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.grado} {c.grupo}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Archivo
              <input type="file" onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} required />
            </label>
            <label>
              Cantidad de copias
              <input
                type="number"
                min={1}
                value={cantidadCopias}
                onChange={(e) => setCantidadCopias(Number(e.target.value))}
                required
              />
            </label>
            <label className="checkbox-row">
              <input type="checkbox" checked={esDobleFaz} onChange={(e) => setEsDobleFaz(e.target.checked)} />
              Doble faz
            </label>
            <label className="checkbox-row">
              <input type="checkbox" checked={aColor} onChange={(e) => setAColor(e.target.checked)} />A color
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
