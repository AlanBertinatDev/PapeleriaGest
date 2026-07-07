import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { documentosApi, type DocumentoResponse } from '../api/documentos'
import { ApiError } from '../api/client'
import { Modal } from '../components/Modal'
import { DocumentoCard } from '../components/DocumentoCard'
import { FilterPills } from '../components/FilterPills'

type Filtro = 'TODOS' | 'PENDIENTE' | 'IMPRESO' | 'ENTREGADO'

export function MisDocumentosPage() {
  const [documentos, setDocumentos] = useState<DocumentoResponse[]>([])
  const [nombre, setNombre] = useState('')
  const [archivo, setArchivo] = useState<File | null>(null)
  const [esDobleFaz, setEsDobleFaz] = useState(false)
  const [aColor, setAColor] = useState(false)
  const [cantidadCopias, setCantidadCopias] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [creando, setCreando] = useState(false)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [filtro, setFiltro] = useState<Filtro>('TODOS')

  function cargar() {
    documentosApi
      .misDocumentos()
      .then(setDocumentos)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los documentos'))
  }

  useEffect(cargar, [])

  function cerrarModal() {
    setModalAbierto(false)
    setNombre('')
    setArchivo(null)
    setEsDobleFaz(false)
    setAColor(false)
    setCantidadCopias(1)
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
        archivo,
        esDobleFaz,
        aColor,
        cantidadCopias,
        esEnvio: false,
        esPractico: false,
        nroPractico: 0,
        esImagen: false,
      })
      cerrarModal()
      cargar()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cargar el documento')
    } finally {
      setCreando(false)
    }
  }

  async function handleEliminar(id: number) {
    try {
      await documentosApi.eliminar(id)
      cargar()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar el documento')
    }
  }

  const opciones = useMemo(
    () => [
      { key: 'TODOS', label: 'Todos', count: documentos.length },
      { key: 'PENDIENTE', label: 'Pendientes', count: documentos.filter((d) => d.estado === 'PENDIENTE').length },
      { key: 'IMPRESO', label: 'Impresos', count: documentos.filter((d) => d.estado === 'IMPRESO').length },
      { key: 'ENTREGADO', label: 'Entregados', count: documentos.filter((d) => d.estado === 'ENTREGADO').length },
    ],
    [documentos],
  )

  const visibles = filtro === 'TODOS' ? documentos : documentos.filter((d) => d.estado === filtro)

  return (
    <div>
      <div className="page-hero">
        <h1>Mis documentos</h1>
        <p>Documentos personales que cargaste para imprimir</p>
      </div>

      <div className="section-header">
        <h3>Listado</h3>
        <button onClick={() => setModalAbierto(true)}>Cargar documento</button>
      </div>
      {error && !modalAbierto && <p className="error">{error}</p>}

      <FilterPills options={opciones} active={filtro} onChange={(k) => setFiltro(k as Filtro)} />

      {visibles.length === 0 && (
        <p className="empty-state">
          {documentos.length === 0 ? 'Todavía no cargaste ningún documento.' : 'No hay documentos en este estado.'}
        </p>
      )}

      <div className="order-grid">
        {visibles.map((doc) => (
          <DocumentoCard
            key={doc.id}
            documento={doc}
            acciones={[{ label: 'Eliminar', onClick: () => handleEliminar(doc.id) }]}
          />
        ))}
      </div>

      {modalAbierto && (
        <Modal title="Cargar documento propio" onClose={cerrarModal}>
          <form onSubmit={handleSubmit}>
            <label>
              Nombre
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </label>
            <label>
              Archivo
              <input
                type="file"
                onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
                required
              />
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
              {creando ? 'Cargando...' : 'Cargar documento'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
