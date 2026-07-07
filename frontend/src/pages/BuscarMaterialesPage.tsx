import { useEffect, useState } from 'react'
import { cursosApi, type CursoResponse } from '../api/cursos'
import { documentosApi, type DocumentoResponse } from '../api/documentos'
import { ApiError } from '../api/client'
import { DocumentoCard } from '../components/DocumentoCard'

export function BuscarMaterialesPage() {
  const [cursos, setCursos] = useState<CursoResponse[]>([])
  const [cursoId, setCursoId] = useState('')
  const [materiales, setMateriales] = useState<DocumentoResponse[]>([])
  const [error, setError] = useState<string | null>(null)
  const [buscando, setBuscando] = useState(false)

  useEffect(() => {
    cursosApi.listar().then(setCursos).catch(() => {})
  }, [])

  async function handleBuscar(id: string) {
    setCursoId(id)
    setError(null)
    if (!id) {
      setMateriales([])
      return
    }
    setBuscando(true)
    try {
      const resultado = await documentosApi.listarPorCurso(Number(id))
      setMateriales(resultado)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los materiales')
    } finally {
      setBuscando(false)
    }
  }

  return (
    <div>
      <div className="page-hero">
        <h1>Buscar materiales</h1>
        <p>Encontrá lo que dejó tu docente para tu curso y pedilo en el mostrador</p>
      </div>
      {error && <p className="error">{error}</p>}

      <div className="card">
        <label>
          Curso
          <select value={cursoId} onChange={(e) => handleBuscar(e.target.value)}>
            <option value="">Seleccioná un curso</option>
            {cursos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.grado} {c.grupo}
              </option>
            ))}
          </select>
        </label>
      </div>

      {buscando && <p className="empty-state">Buscando...</p>}
      {!buscando && cursoId && materiales.length === 0 && (
        <p className="empty-state">No hay materiales cargados para este curso todavía.</p>
      )}

      <div className="order-grid">
        {materiales.map((doc) => (
          <DocumentoCard key={doc.id} documento={doc} mostrarUsuario />
        ))}
      </div>
    </div>
  )
}
