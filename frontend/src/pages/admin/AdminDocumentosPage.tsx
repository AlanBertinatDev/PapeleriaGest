import { useEffect, useState, type FormEvent } from 'react'
import { documentosApi, type DocumentoResponse } from '../../api/documentos'
import { ApiError } from '../../api/client'
import { DocumentoCard } from '../../components/DocumentoCard'
import { Modal } from '../../components/Modal'
import { PageHeader } from '../../components/PageHeader'

export function AdminDocumentosPage() {
  const [documentos, setDocumentos] = useState<DocumentoResponse[]>([])
  const [error, setError] = useState<string | null>(null)
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

  async function handleEliminar(id: number) {
    setError(null)
    try {
      await documentosApi.eliminar(id)
      cargar()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar el documento')
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

  return (
    <div>
      <PageHeader
        title="Documentos"
        subtitle="Materiales de docentes y archivos propios de la papelería. Las impresiones pedidas se gestionan desde Pedidos."
        action={<button onClick={() => setModalAbierto(true)}>Subir archivo propio</button>}
      />
      {error && !modalAbierto && <p className="error">{error}</p>}

      {documentos.length === 0 && <p className="empty-state">No hay documentos cargados.</p>}

      <div className="order-grid">
        {documentos.map((doc) => (
          <DocumentoCard
            key={doc.id}
            documento={doc}
            mostrarUsuario
            acciones={[{ label: 'Eliminar', onClick: () => handleEliminar(doc.id) }]}
          />
        ))}
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
