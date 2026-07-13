import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cursosApi, type CursoResponse } from '../api/cursos'
import { documentosApi, type DocumentoResponse } from '../api/documentos'
import { ApiError } from '../api/client'
import { DocumentoCard } from '../components/DocumentoCard'
import { PageHeader } from '../components/PageHeader'

export function BuscarMaterialesPage() {
  const navigate = useNavigate()
  const [cursos, setCursos] = useState<CursoResponse[]>([])
  const [cursoId, setCursoId] = useState('')
  const [materiales, setMateriales] = useState<DocumentoResponse[]>([])
  const [error, setError] = useState<string | null>(null)
  const [buscando, setBuscando] = useState(false)

  useEffect(() => {
    cursosApi.misCursos().then((lista) => {
      setCursos(lista)
      if (lista.length === 1) {
        handleBuscar(String(lista[0].id))
      }
    }).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <PageHeader
        title="Buscar materiales"
        subtitle="Encontrá lo que dejó tu docente para tu curso y pedilo a imprimir desde el catálogo"
      />
      {error && <p className="error">{error}</p>}

      {cursos.length === 0 && (
        <p className="empty-state">
          Todavía no estás inscripto en ningún curso. Pedile al administrador que te inscriba.
        </p>
      )}

      {cursos.length > 1 && (
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
      )}

      {buscando && <p className="empty-state">Buscando...</p>}
      {!buscando && cursoId && materiales.length === 0 && (
        <p className="empty-state">No hay materiales cargados para este curso todavía.</p>
      )}

      <div className="order-grid">
        {materiales.map((doc) => (
          <DocumentoCard
            key={doc.id}
            documento={doc}
            mostrarUsuario
            permitirDescarga={false}
            acciones={[
              {
                label: 'Pedir impresión',
                destacada: true,
                onClick: () => navigate('/catalogo'),
              },
            ]}
          />
        ))}
      </div>
    </div>
  )
}
