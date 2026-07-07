import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { documentosApi, type DocumentoResponse } from '../../api/documentos'
import { ApiError } from '../../api/client'
import { DocumentoCard } from '../../components/DocumentoCard'
import { FilterPills } from '../../components/FilterPills'
import { Modal } from '../../components/Modal'

type Filtro = 'TODOS' | 'PENDIENTE' | 'IMPRESO' | 'ENTREGADO'

export function AdminDocumentosPage() {
  const [documentos, setDocumentos] = useState<DocumentoResponse[]>([])
  const [error, setError] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<Filtro>('PENDIENTE')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [nombre, setNombre] = useState('')
  const [archivo, setArchivo] = useState<File | null>(null)
  const [creando, setCreando] = useState(false)

  function cargar() {
    documentosApi
      .listarTodos()
      .then(setDocumentos)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los documentos'))
  }

  useEffect(cargar, [])

  async function handleCambiarEstado(id: number, estado: string) {
    setError(null)
    try {
      await documentosApi.cambiarEstado(id, estado)
      cargar()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cambiar el estado')
    }
  }

  function cerrarModal() {
    setModalAbierto(false)
    setNombre('')
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
        archivo,
        esDobleFaz: false,
        aColor: false,
        cantidadCopias: 1,
        esEnvio: false,
        esPractico: false,
        nroPractico: 0,
        esImagen: false,
      })
      cerrarModal()
      cargar()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo subir el archivo')
    } finally {
      setCreando(false)
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
        <h1>Documentos</h1>
        <p>Cola de impresión: materiales de docentes y documentos personales</p>
      </div>

      <div className="section-header">
        <h3>Traza de documentos</h3>
        <button onClick={() => setModalAbierto(true)}>Subir archivo propio</button>
      </div>
      {error && !modalAbierto && <p className="error">{error}</p>}

      <FilterPills options={opciones} active={filtro} onChange={(k) => setFiltro(k as Filtro)} />

      {visibles.length === 0 && (
        <p className="empty-state">
          {documentos.length === 0 ? 'No hay documentos cargados.' : 'No hay documentos en este estado.'}
        </p>
      )}

      <div className="order-grid">
        {visibles.map((doc) => {
          const acciones = []
          if (doc.estado === 'PENDIENTE') {
            acciones.push({
              label: 'Marcar impreso',
              destacada: true,
              onClick: () => handleCambiarEstado(doc.id, 'IMPRESO'),
            })
          } else if (doc.estado === 'IMPRESO') {
            acciones.push({
              label: 'Marcar entregado',
              destacada: true,
              onClick: () => handleCambiarEstado(doc.id, 'ENTREGADO'),
            })
            acciones.push({
              label: 'Volver a pendiente',
              onClick: () => handleCambiarEstado(doc.id, 'PENDIENTE'),
            })
          }
          return <DocumentoCard key={doc.id} documento={doc} mostrarUsuario acciones={acciones} />
        })}
      </div>

      {modalAbierto && (
        <Modal title="Subir archivo propio" onClose={cerrarModal}>
          <form onSubmit={handleSubmit}>
            <label>
              Nombre
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Planilla de proveedores" required />
            </label>
            <label>
              Archivo
              <input type="file" onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} required />
            </label>
            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={creando}>
              {creando ? 'Subiendo...' : 'Subir archivo'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
