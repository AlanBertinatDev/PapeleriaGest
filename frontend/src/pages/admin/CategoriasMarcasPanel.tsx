import { useEffect, useState, type FormEvent } from 'react'
import { categoriasApi, marcasApi, type CategoriaProductoResponse, type MarcaResponse } from '../../api/productos'
import { ApiError } from '../../api/client'
import { Modal } from '../../components/Modal'

export function CategoriasMarcasPanel() {
  const [categorias, setCategorias] = useState<CategoriaProductoResponse[]>([])
  const [marcas, setMarcas] = useState<MarcaResponse[]>([])
  const [nombreCategoria, setNombreCategoria] = useState('')
  const [porcentaje, setPorcentaje] = useState(0)
  const [nombreMarca, setNombreMarca] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [modalCategoriaAbierto, setModalCategoriaAbierto] = useState(false)
  const [modalMarcaAbierto, setModalMarcaAbierto] = useState(false)

  function cargar() {
    categoriasApi.listar().then(setCategorias).catch(() => {})
    marcasApi.listar().then(setMarcas).catch(() => {})
  }

  useEffect(cargar, [])

  function cerrarModalCategoria() {
    setModalCategoriaAbierto(false)
    setNombreCategoria('')
    setPorcentaje(0)
    setError(null)
  }

  function cerrarModalMarca() {
    setModalMarcaAbierto(false)
    setNombreMarca('')
    setError(null)
  }

  async function handleCrearCategoria(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await categoriasApi.crear(nombreCategoria, porcentaje)
      cerrarModalCategoria()
      cargar()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear la categoría')
    }
  }

  async function handleCrearMarca(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await marcasApi.crear(nombreMarca)
      cerrarModalMarca()
      cargar()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear la marca')
    }
  }

  return (
    <div>
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div className="card" style={{ flex: 1, minWidth: 280 }}>
          <div className="section-header">
            <h3>Categorías</h3>
            <button onClick={() => setModalCategoriaAbierto(true)}>Agregar</button>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map((c) => (
                  <tr key={c.id}>
                    <td>{c.nombre}</td>
                    <td>{c.porcentaje}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ flex: 1, minWidth: 280 }}>
          <div className="section-header">
            <h3>Marcas</h3>
            <button onClick={() => setModalMarcaAbierto(true)}>Agregar</button>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                </tr>
              </thead>
              <tbody>
                {marcas.map((m) => (
                  <tr key={m.id}>
                    <td>{m.nombre}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalCategoriaAbierto && (
        <Modal title="Nueva categoría" onClose={cerrarModalCategoria}>
          <form onSubmit={handleCrearCategoria}>
            <label>
              Nombre
              <input value={nombreCategoria} onChange={(e) => setNombreCategoria(e.target.value)} required />
            </label>
            <label>
              Porcentaje (IVA/recargo)
              <input type="number" value={porcentaje} onChange={(e) => setPorcentaje(Number(e.target.value))} />
            </label>
            {error && <p className="error">{error}</p>}
            <button type="submit">Agregar categoría</button>
          </form>
        </Modal>
      )}

      {modalMarcaAbierto && (
        <Modal title="Nueva marca" onClose={cerrarModalMarca}>
          <form onSubmit={handleCrearMarca}>
            <label>
              Nombre
              <input value={nombreMarca} onChange={(e) => setNombreMarca(e.target.value)} required />
            </label>
            {error && <p className="error">{error}</p>}
            <button type="submit">Agregar marca</button>
          </form>
        </Modal>
      )}
    </div>
  )
}
