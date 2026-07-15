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
  const [categoriaEditando, setCategoriaEditando] = useState<CategoriaProductoResponse | null>(null)
  const [modalCategoriaAbierto, setModalCategoriaAbierto] = useState(false)
  const [marcaEditando, setMarcaEditando] = useState<MarcaResponse | null>(null)
  const [modalMarcaAbierto, setModalMarcaAbierto] = useState(false)

  function cargar() {
    categoriasApi.listar().then(setCategorias).catch(() => {})
    marcasApi.listar().then(setMarcas).catch(() => {})
  }

  useEffect(cargar, [])

  function abrirNuevaCategoria() {
    setCategoriaEditando(null)
    setNombreCategoria('')
    setPorcentaje(0)
    setError(null)
    setModalCategoriaAbierto(true)
  }

  function abrirEditarCategoria(categoria: CategoriaProductoResponse) {
    setCategoriaEditando(categoria)
    setNombreCategoria(categoria.nombre)
    setPorcentaje(categoria.porcentaje)
    setError(null)
    setModalCategoriaAbierto(true)
  }

  function cerrarModalCategoria() {
    setModalCategoriaAbierto(false)
    setCategoriaEditando(null)
    setNombreCategoria('')
    setPorcentaje(0)
    setError(null)
  }

  function abrirNuevaMarca() {
    setMarcaEditando(null)
    setNombreMarca('')
    setError(null)
    setModalMarcaAbierto(true)
  }

  function abrirEditarMarca(marca: MarcaResponse) {
    setMarcaEditando(marca)
    setNombreMarca(marca.nombre)
    setError(null)
    setModalMarcaAbierto(true)
  }

  function cerrarModalMarca() {
    setModalMarcaAbierto(false)
    setMarcaEditando(null)
    setNombreMarca('')
    setError(null)
  }

  async function handleGuardarCategoria(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      if (categoriaEditando) {
        await categoriasApi.actualizar(categoriaEditando.id, nombreCategoria, porcentaje)
      } else {
        await categoriasApi.crear(nombreCategoria, porcentaje)
      }
      cerrarModalCategoria()
      cargar()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar la categoría')
    }
  }

  async function handleDesactivarCategoria(categoria: CategoriaProductoResponse) {
    if (!window.confirm(`¿Desactivar la categoría "${categoria.nombre}"?`)) return
    try {
      await categoriasApi.desactivar(categoria.id)
      cargar()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo desactivar la categoría')
    }
  }

  async function handleGuardarMarca(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      if (marcaEditando) {
        await marcasApi.actualizar(marcaEditando.id, nombreMarca)
      } else {
        await marcasApi.crear(nombreMarca)
      }
      cerrarModalMarca()
      cargar()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar la marca')
    }
  }

  async function handleDesactivarMarca(marca: MarcaResponse) {
    if (!window.confirm(`¿Desactivar la marca "${marca.nombre}"?`)) return
    try {
      await marcasApi.desactivar(marca.id)
      cargar()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo desactivar la marca')
    }
  }

  return (
    <div>
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div className="card" style={{ flex: 1, minWidth: 280 }}>
          <div className="section-header">
            <h3>Categorías</h3>
            <button onClick={abrirNuevaCategoria}>Agregar</button>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>%</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {categorias.map((c) => (
                  <tr key={c.id}>
                    <td>{c.nombre}</td>
                    <td>{c.porcentaje}</td>
                    <td>
                      <button className="secondary" onClick={() => abrirEditarCategoria(c)}>
                        Editar
                      </button>
                      <button className="secondary" onClick={() => handleDesactivarCategoria(c)}>
                        Desactivar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ flex: 1, minWidth: 280 }}>
          <div className="section-header">
            <h3>Marcas</h3>
            <button onClick={abrirNuevaMarca}>Agregar</button>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {marcas.map((m) => (
                  <tr key={m.id}>
                    <td>{m.nombre}</td>
                    <td>
                      <button className="secondary" onClick={() => abrirEditarMarca(m)}>
                        Editar
                      </button>
                      <button className="secondary" onClick={() => handleDesactivarMarca(m)}>
                        Desactivar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalCategoriaAbierto && (
        <Modal title={categoriaEditando ? 'Editar categoría' : 'Nueva categoría'} onClose={cerrarModalCategoria}>
          <form onSubmit={handleGuardarCategoria}>
            <label>
              Nombre
              <input value={nombreCategoria} onChange={(e) => setNombreCategoria(e.target.value)} required />
            </label>
            <label>
              Porcentaje (IVA/recargo)
              <input
                type="number"
                min="0"
                value={porcentaje}
                onChange={(e) => setPorcentaje(Number(e.target.value))}
              />
            </label>
            {error && <p className="error">{error}</p>}
            <button type="submit">{categoriaEditando ? 'Guardar cambios' : 'Agregar categoría'}</button>
          </form>
        </Modal>
      )}

      {modalMarcaAbierto && (
        <Modal title={marcaEditando ? 'Editar marca' : 'Nueva marca'} onClose={cerrarModalMarca}>
          <form onSubmit={handleGuardarMarca}>
            <label>
              Nombre
              <input value={nombreMarca} onChange={(e) => setNombreMarca(e.target.value)} required />
            </label>
            {error && <p className="error">{error}</p>}
            <button type="submit">{marcaEditando ? 'Guardar cambios' : 'Agregar marca'}</button>
          </form>
        </Modal>
      )}
    </div>
  )
}
