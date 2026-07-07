import { useEffect, useState, type FormEvent } from 'react'
import { ofertasApi, type OfertaResponse } from '../../api/ofertas'
import { productosApi, type ProductoResponse } from '../../api/productos'
import { ApiError } from '../../api/client'
import { EstadoBadge } from '../../components/EstadoBadge'
import { Modal } from '../../components/Modal'
import { AuthImage } from '../../components/AuthImage'

export function AdminOfertasPage() {
  const [ofertas, setOfertas] = useState<OfertaResponse[]>([])
  const [productos, setProductos] = useState<ProductoResponse[]>([])
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [precio, setPrecio] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [productoIds, setProductoIds] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)
  const [creando, setCreando] = useState(false)
  const [modalAbierto, setModalAbierto] = useState(false)

  function cargar() {
    ofertasApi
      .listarTodas()
      .then(setOfertas)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'No se pudieron cargar las ofertas'))
    productosApi.listar().then(setProductos).catch(() => {})
  }

  useEffect(cargar, [])

  function cerrarModal() {
    setModalAbierto(false)
    setTitulo('')
    setDescripcion('')
    setPrecio('')
    setFechaDesde('')
    setFechaHasta('')
    setProductoIds([])
    setError(null)
  }

  function toggleProducto(codigo: number) {
    setProductoIds((prev) => (prev.includes(codigo) ? prev.filter((id) => id !== codigo) : [...prev, codigo]))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (productoIds.length === 0) {
      setError('Elegí al menos un producto para la oferta')
      return
    }
    setError(null)
    setCreando(true)
    try {
      await ofertasApi.crear({
        titulo,
        descripcion: descripcion || null,
        precio,
        fechaDesde,
        fechaHasta,
        imagenesUrls: [],
        productoIds,
      })
      cerrarModal()
      cargar()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear la oferta')
    } finally {
      setCreando(false)
    }
  }

  async function handleEliminar(id: number) {
    try {
      await ofertasApi.eliminar(id)
      cargar()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar la oferta')
    }
  }

  return (
    <div>
      <div className="page-hero">
        <h1>Ofertas</h1>
        <p>Promociones publicadas a los clientes</p>
      </div>

      <div className="section-header">
        <h3>Listado</h3>
        <button onClick={() => setModalAbierto(true)}>Agregar oferta</button>
      </div>
      {error && !modalAbierto && <p className="error">{error}</p>}

      {ofertas.length === 0 && <p className="empty-state">No hay ofertas cargadas.</p>}

      <div className="tile-grid">
        {ofertas.map((oferta) => (
          <div className="tile-card" key={oferta.id}>
            <div className="tile-image-wrap">
              {oferta.productos[0]?.tieneImagen ? (
                <AuthImage src={`/productos/${oferta.productos[0].codigoProducto}/imagen`} alt={oferta.titulo} />
              ) : (
                <div className="image-placeholder" aria-label="Sin foto" />
              )}
            </div>
            <div className="tile-body">
              <div className="tile-title">{oferta.titulo}</div>
              <div className="tile-meta">
                {oferta.fechaDesde} a {oferta.fechaHasta}
              </div>
              <div className="tile-price">${oferta.precio}</div>
              <div className="tile-product-chip-list">
                {oferta.productos.map((p) => (
                  <span className="tile-product-chip" key={p.codigoProducto}>
                    {p.nombre}
                  </span>
                ))}
              </div>
              <div style={{ marginTop: 4 }}>
                <EstadoBadge estado={oferta.activo ? 'Activa' : 'Inactiva'} />
              </div>
              <div className="tile-actions">
                <button className="secondary" onClick={() => handleEliminar(oferta.id)}>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalAbierto && (
        <Modal title="Nueva oferta" onClose={cerrarModal}>
          <form onSubmit={handleSubmit}>
            <label>
              Título
              <input value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
            </label>
            <label>
              Descripción
              <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            </label>
            <label>
              Precio promocional
              <input value={precio} onChange={(e) => setPrecio(e.target.value)} required />
            </label>
            <label>
              Vigente desde
              <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} required />
            </label>
            <label>
              Vigente hasta
              <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} required />
            </label>
            <label>Productos incluidos</label>
            <div className="checkbox-list">
              {productos.map((p) => (
                <label className="checkbox-row" key={p.codigoProducto}>
                  <input
                    type="checkbox"
                    checked={productoIds.includes(p.codigoProducto)}
                    onChange={() => toggleProducto(p.codigoProducto)}
                  />
                  {p.nombre} — ${p.precioVenta}
                </label>
              ))}
              {productos.length === 0 && <p className="empty-state">No hay productos cargados todavía.</p>}
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={creando}>
              {creando ? 'Creando...' : 'Crear oferta'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
