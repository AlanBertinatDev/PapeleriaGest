import { useEffect, useState, type FormEvent } from 'react'
import { documentosApi, type DocumentoResponse } from '../api/documentos'
import { ApiError } from '../api/client'
import { Modal } from '../components/Modal'
import { DocumentoCard } from '../components/DocumentoCard'
import { PageHeader } from '../components/PageHeader'

export function MisDocumentosPage() {
  const [documentos, setDocumentos] = useState<DocumentoResponse[]>([])
  const [nombre, setNombre] = useState('')
  const [archivo, setArchivo] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [creando, setCreando] = useState(false)
  const [modalAbierto, setModalAbierto] = useState(false)

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

  return (
    <div>
      <PageHeader title="Mis documentos" subtitle="Tu biblioteca de archivos personales para imprimir" />

      <div className="section-header">
        <h3>Listado</h3>
        <button onClick={() => setModalAbierto(true)}>Cargar documento</button>
      </div>
      {error && !modalAbierto && <p className="error">{error}</p>}

      {documentos.length === 0 && <p className="empty-state">Todavía no cargaste ningún documento.</p>}

      <div className="order-grid">
        {documentos.map((doc) => (
          <DocumentoCard
            key={doc.id}
            documento={doc}
            acciones={[{ label: 'Eliminar', onClick: () => handleEliminar(doc.id) }]}
          />
        ))}
      </div>

      {modalAbierto && (
        <Modal title="Cargar documento para imprimir" onClose={cerrarModal}>
          <form onSubmit={handleSubmit}>
            <label>
              Nombre
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </label>
            <label>
              Archivo
              <input type="file" onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} required />
            </label>

            <p style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>
              Elegís cantidad de copias, color, papel y terminación cuando pidas imprimirlo desde el catálogo.
            </p>

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
