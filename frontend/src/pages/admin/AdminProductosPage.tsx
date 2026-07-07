import { useEffect, useRef, useState, type FormEvent } from 'react'
import { categoriasApi, marcasApi, productosApi, type CategoriaProductoResponse, type MarcaResponse, type ProductoResponse } from '../../api/productos'
import { ApiError } from '../../api/client'
import { Modal } from '../../components/Modal'
import { AuthImage } from '../../components/AuthImage'
import { CategoriasMarcasPanel } from './CategoriasMarcasPanel'

const emptyForm = {
  codigoProducto: '',
  nombre: '',
  precioVenta: '',
  precioCompra: '',
  categoriaId: '',
  marcaId: '',
  cantidad: '0',
  unidadMedida: '',
  iva: '',
  stockMinimo: '0',
}

type Tab = 'productos' | 'categorias' | 'inactivos'

export function AdminProductosPage() {
  const [tab, setTab] = useState<Tab>('productos')
  const [productos, setProductos] = useState<ProductoResponse[]>([])
  const [inactivos, setInactivos] = useState<ProductoResponse[]>([])
  const [categorias, setCategorias] = useState<CategoriaProductoResponse[]>([])
  const [marcas, setMarcas] = useState<MarcaResponse[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editando, setEditando] = useState<ProductoResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [reponiendo, setReponiendo] = useState<ProductoResponse | null>(null)
  const [cantidadAReponer, setCantidadAReponer] = useState('')
  const [ventaTocada, setVentaTocada] = useState(false)
  const fileInputsRef = useRef<Record<number, HTMLInputElement | null>>({})

  function cargar() {
    productosApi.listar().then(setProductos).catch(() => {})
    productosApi.listarInactivos().then(setInactivos).catch(() => {})
    categoriasApi.listar().then(setCategorias).catch(() => {})
    marcasApi.listar().then(setMarcas).catch(() => {})
  }

  useEffect(cargar, [])

  function updateForm<K extends keyof typeof emptyForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function sugerirVenta(precioCompraStr: string, categoriaId: string) {
    if (ventaTocada) return
    const precioCompra = Number(precioCompraStr)
    const categoria = categorias.find((c) => String(c.id) === categoriaId)
    if (!categoria || !precioCompra || precioCompra <= 0) return
    const sugerido = precioCompra * (1 + categoria.porcentaje / 100)
    setForm((prev) => ({ ...prev, precioVenta: sugerido.toFixed(2) }))
  }

  function handlePrecioCompraChange(value: string) {
    updateForm('precioCompra', value)
    sugerirVenta(value, form.categoriaId)
  }

  function handleCategoriaChange(value: string) {
    updateForm('categoriaId', value)
    sugerirVenta(form.precioCompra, value)
  }

  function abrirNuevo() {
    setEditando(null)
    setForm(emptyForm)
    setVentaTocada(false)
    setError(null)
    setModalAbierto(true)
  }

  function abrirEditar(p: ProductoResponse) {
    setEditando(p)
    setForm({
      codigoProducto: String(p.codigoProducto),
      nombre: p.nombre,
      precioVenta: p.precioVenta,
      precioCompra: p.precioCompra,
      categoriaId: String(p.categoria.id),
      marcaId: p.marca ? String(p.marca.id) : '',
      cantidad: String(p.cantidad),
      unidadMedida: p.unidadMedida ?? '',
      iva: p.iva ?? '',
      stockMinimo: String(p.stockMinimo),
    })
    setVentaTocada(true)
    setError(null)
    setModalAbierto(true)
  }

  function cerrarModal() {
    setModalAbierto(false)
    setEditando(null)
    setForm(emptyForm)
    setError(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setGuardando(true)
    const data = {
      codigoProducto: Number(form.codigoProducto),
      nombre: form.nombre,
      precioVenta: form.precioVenta,
      precioCompra: form.precioCompra,
      categoriaId: Number(form.categoriaId),
      marcaId: form.marcaId ? Number(form.marcaId) : null,
      cantidad: Number(form.cantidad),
      unidadMedida: form.unidadMedida || null,
      iva: form.iva || null,
      stockMinimo: Number(form.stockMinimo),
    }
    try {
      if (editando) {
        await productosApi.actualizar(editando.codigoProducto, data)
      } else {
        await productosApi.crear(data)
      }
      cerrarModal()
      cargar()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar el producto')
    } finally {
      setGuardando(false)
    }
  }

  async function handleDesactivar(codigo: number) {
    try {
      await productosApi.desactivar(codigo)
      cargar()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo desactivar el producto')
    }
  }

  async function handleReactivar(codigo: number) {
    try {
      await productosApi.reactivar(codigo)
      cargar()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo reactivar el producto')
    }
  }

  async function handleSubirFoto(codigo: number, archivo: File) {
    try {
      await productosApi.subirImagen(codigo, archivo)
      cargar()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo subir la foto')
    }
  }

  function cerrarReponer() {
    setReponiendo(null)
    setCantidadAReponer('')
    setError(null)
  }

  async function handleReponerStock(e: FormEvent) {
    e.preventDefault()
    if (!reponiendo) return
    setError(null)
    try {
      await productosApi.reponerStock(reponiendo.codigoProducto, Number(cantidadAReponer))
      cerrarReponer()
      cargar()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo reponer el stock')
    }
  }

  return (
    <div>
      <div className="page-hero">
        <h1>Productos</h1>
        <p>Catálogo de venta de la papelería</p>
      </div>

      <div className="filter-pills">
        <button className={`filter-pill${tab === 'productos' ? ' active' : ''}`} onClick={() => setTab('productos')}>
          Productos
        </button>
        <button className={`filter-pill${tab === 'inactivos' ? ' active' : ''}`} onClick={() => setTab('inactivos')}>
          Inactivos <span className="count">{inactivos.length}</span>
        </button>
        <button className={`filter-pill${tab === 'categorias' ? ' active' : ''}`} onClick={() => setTab('categorias')}>
          Categorías y marcas
        </button>
      </div>

      {tab === 'categorias' && <CategoriasMarcasPanel />}

      {tab === 'inactivos' && (
        <>
          {error && <p className="error">{error}</p>}
          {inactivos.length === 0 && <p className="empty-state">No hay productos desactivados.</p>}
          <div className="tile-grid">
            {inactivos.map((p) => (
              <div className="tile-card" key={p.codigoProducto}>
                <div className="tile-image-wrap">
                  {p.tieneImagen ? (
                    <AuthImage src={`/productos/${p.codigoProducto}/imagen`} alt={p.nombre} />
                  ) : (
                    <div className="image-placeholder" aria-label="Sin foto" />
                  )}
                </div>
                <div className="tile-body">
                  <div className="tile-title">{p.nombre}</div>
                  <div className="tile-meta">
                    {p.categoria.nombre}
                    {p.marca && ` · ${p.marca.nombre}`}
                  </div>
                  <div className="tile-price">${p.precioVenta}</div>
                  <div className="tile-actions">
                    <button onClick={() => handleReactivar(p.codigoProducto)}>Reactivar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'productos' && (
        <>
          <div className="section-header">
            <h3>Listado</h3>
            <button onClick={abrirNuevo}>Agregar producto</button>
          </div>
          {error && !modalAbierto && !reponiendo && <p className="error">{error}</p>}

          <div className="tile-grid">
            {productos.map((p) => (
              <div className="tile-card" key={p.codigoProducto}>
                <button
                  className="tile-image-wrap"
                  onClick={() => fileInputsRef.current[p.codigoProducto]?.click()}
                  type="button"
                  aria-label={p.tieneImagen ? 'Cambiar foto' : 'Agregar foto'}
                >
                  {p.tieneImagen ? (
                    <AuthImage src={`/productos/${p.codigoProducto}/imagen`} alt={p.nombre} />
                  ) : (
                    <div className="image-placeholder" aria-label="Sin foto" />
                  )}
                  <div className="tile-image-overlay">{p.tieneImagen ? 'Cambiar foto' : 'Agregar foto'}</div>
                </button>
                <input
                  type="file"
                  accept="image/*"
                  className="tile-photo-input"
                  ref={(el) => {
                    fileInputsRef.current[p.codigoProducto] = el
                  }}
                  onChange={(e) => {
                    const archivo = e.target.files?.[0]
                    if (archivo) handleSubirFoto(p.codigoProducto, archivo)
                    e.target.value = ''
                  }}
                />
                <div className="tile-body">
                  <div className="tile-title">{p.nombre}</div>
                  <div className="tile-meta">
                    {p.categoria.nombre}
                    {p.marca && ` · ${p.marca.nombre}`}
                  </div>
                  <div className="tile-price">${p.precioVenta}</div>
                  <div className="tile-meta">
                    Stock: {p.cantidad} {p.stockBajo && <span className="badge badge-cancelado">Stock bajo</span>}
                  </div>
                  <div className="tile-actions">
                    <button className="secondary" onClick={() => setReponiendo(p)}>
                      Reponer stock
                    </button>
                    <button className="secondary" onClick={() => abrirEditar(p)}>
                      Editar
                    </button>
                  </div>
                  <div className="tile-actions">
                    <button className="secondary" onClick={() => handleDesactivar(p.codigoProducto)}>
                      Desactivar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {modalAbierto && (
        <Modal title={editando ? `Editar ${editando.nombre}` : 'Nuevo producto'} onClose={cerrarModal}>
          <form onSubmit={handleSubmit}>
            <label>
              Código
              <input
                value={form.codigoProducto}
                onChange={(e) => updateForm('codigoProducto', e.target.value)}
                required
                disabled={!!editando}
              />
            </label>
            <label>
              Nombre
              <input value={form.nombre} onChange={(e) => updateForm('nombre', e.target.value)} required />
            </label>
            <label>
              Precio de compra
              <input value={form.precioCompra} onChange={(e) => handlePrecioCompraChange(e.target.value)} required />
            </label>
            <label>
              Categoría
              <select value={form.categoriaId} onChange={(e) => handleCategoriaChange(e.target.value)} required>
                <option value="">Seleccionar</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({c.porcentaje}%)
                  </option>
                ))}
              </select>
            </label>
            <label>
              Precio de venta
              <input
                value={form.precioVenta}
                onChange={(e) => {
                  setVentaTocada(true)
                  updateForm('precioVenta', e.target.value)
                }}
                required
              />
            </label>
            <p style={{ marginTop: -8, fontSize: 12, color: 'var(--ink-soft)' }}>
              Se sugiere solo automáticamente a partir del precio de compra y el % de la categoría — podés cambiarlo
              cuando quieras.
            </p>
            <label>
              Marca
              <select value={form.marcaId} onChange={(e) => updateForm('marcaId', e.target.value)}>
                <option value="">Sin marca</option>
                {marcas.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Cantidad en stock
              <input value={form.cantidad} onChange={(e) => updateForm('cantidad', e.target.value)} />
            </label>
            {editando && (
              <p style={{ marginTop: -8, fontSize: 12, color: 'var(--ink-soft)' }}>
                Para sumar unidades por una compra nueva, usá "Reponer stock" en vez de editar este número a mano.
              </p>
            )}
            <label>
              Stock mínimo
              <input value={form.stockMinimo} onChange={(e) => updateForm('stockMinimo', e.target.value)} />
            </label>
            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={guardando}>
              {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </form>
        </Modal>
      )}

      {reponiendo && (
        <Modal title={`Reponer stock de ${reponiendo.nombre}`} onClose={cerrarReponer}>
          <form onSubmit={handleReponerStock}>
            <p style={{ marginTop: 0, color: 'var(--ink-soft)', fontSize: 13 }}>
              Stock actual: {reponiendo.cantidad} unidades
            </p>
            <label>
              Unidades que compraste/ingresaron
              <input
                type="number"
                min={1}
                value={cantidadAReponer}
                onChange={(e) => setCantidadAReponer(e.target.value)}
                required
                autoFocus
              />
            </label>
            {error && <p className="error">{error}</p>}
            <button type="submit">Sumar al stock</button>
          </form>
        </Modal>
      )}
    </div>
  )
}
