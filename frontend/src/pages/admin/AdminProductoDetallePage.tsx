import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  categoriasApi,
  marcasApi,
  productosApi,
  type CategoriaProductoResponse,
  type MarcaResponse,
  type ProductoResponse,
} from '../../api/productos'
import { ApiError } from '../../api/client'
import { Modal } from '../../components/Modal'
import { AuthImage } from '../../components/AuthImage'
import { PageHeader } from '../../components/PageHeader'
import { CategoryTag } from '../../components/CategoryTag'
import { categoryBorderColor, categoryTintColor } from '../../lib/categoryColor'
import styles from './AdminProductoDetallePage.module.css'

const emptyForm = {
  codigoProducto: '',
  nombre: '',
  descripcion: '',
  precioVenta: '',
  precioCompra: '',
  categoriaId: '',
  marcaId: '',
  cantidad: '0',
  unidadMedida: '',
  iva: '',
  stockMinimo: '0',
}

export function AdminProductoDetallePage() {
  const { codigo } = useParams<{ codigo: string }>()
  const editando = codigo !== undefined
  const navigate = useNavigate()

  const [producto, setProducto] = useState<ProductoResponse | null>(null)
  const [categorias, setCategorias] = useState<CategoriaProductoResponse[]>([])
  const [marcas, setMarcas] = useState<MarcaResponse[]>([])
  const [form, setForm] = useState(emptyForm)
  const [ventaTocada, setVentaTocada] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [reponiendo, setReponiendo] = useState(false)
  const [cantidadAReponer, setCantidadAReponer] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  function cargarProducto() {
    if (!codigo) return
    productosApi
      .buscar(Number(codigo))
      .then((p) => {
        setProducto(p)
        setForm({
          codigoProducto: String(p.codigoProducto),
          nombre: p.nombre,
          descripcion: p.descripcion ?? '',
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
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'No se pudo cargar el producto'))
  }

  useEffect(() => {
    categoriasApi.listar().then(setCategorias).catch(() => {})
    marcasApi.listar().then(setMarcas).catch(() => {})
    cargarProducto()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codigo])

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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setGuardando(true)
    const data = {
      codigoProducto: Number(form.codigoProducto),
      nombre: form.nombre,
      descripcion: form.descripcion || null,
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
      if (editando && producto) {
        await productosApi.actualizar(producto.codigoProducto, data)
        navigate('/admin/productos')
      } else {
        const creado = await productosApi.crear(data)
        navigate(`/admin/productos/${creado.codigoProducto}`)
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar el producto')
    } finally {
      setGuardando(false)
    }
  }

  async function handleSubirFoto(archivo: File) {
    if (!producto) return
    try {
      await productosApi.subirImagen(producto.codigoProducto, archivo)
      cargarProducto()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo subir la foto')
    }
  }

  async function handleReponerStock(e: FormEvent) {
    e.preventDefault()
    if (!producto) return
    setError(null)
    try {
      await productosApi.reponerStock(producto.codigoProducto, Number(cantidadAReponer))
      setReponiendo(false)
      setCantidadAReponer('')
      cargarProducto()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo reponer el stock')
    }
  }

  const categoriaNombre = categorias.find((c) => String(c.id) === form.categoriaId)?.nombre ?? ''

  return (
    <div>
      <PageHeader
        title={editando ? 'Editar producto' : 'Nuevo producto'}
        breadcrumb={[
          { label: 'Productos', to: '/admin/productos' },
          { label: editando ? form.nombre || '...' : 'Nuevo producto' },
        ]}
        action={
          <>
            <button className="secondary" onClick={() => navigate('/admin/productos')}>
              Cancelar
            </button>
            <button type="submit" form="producto-form" disabled={guardando}>
              {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </>
        }
      />

      {error && <p className="error">{error}</p>}

      <div className={styles.grid}>
        <div className={styles.imageCol}>
          {editando && producto ? (
            <>
              <button
                type="button"
                className={styles.mainImage}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: categoryTintColor(categoriaNombre || producto.categoria.nombre, 0.96, 0.012),
                  borderTopColor: categoryBorderColor(categoriaNombre || producto.categoria.nombre),
                }}
                aria-label={producto.tieneImagen ? 'Cambiar foto' : 'Agregar foto'}
              >
                {producto.tieneImagen ? (
                  <AuthImage src={`/productos/${producto.codigoProducto}/imagen`} alt={producto.nombre} />
                ) : (
                  <div className="image-placeholder" aria-label="Sin foto" />
                )}
                <div className="tile-image-overlay">{producto.tieneImagen ? 'Cambiar foto' : 'Agregar foto'}</div>
              </button>
              <input
                type="file"
                accept="image/*"
                className="tile-photo-input"
                ref={fileInputRef}
                onChange={(e) => {
                  const archivo = e.target.files?.[0]
                  if (archivo) handleSubirFoto(archivo)
                  e.target.value = ''
                }}
              />
              <div className={styles.stockPanel}>
                <div className={styles.stockPanelTitle}>Stock</div>
                <div className={styles.stockRow}>
                  <span>Disponible</span>
                  <span className={styles.stockBadge}>{producto.cantidad} unidades</span>
                </div>
                <button className="secondary" style={{ width: '100%' }} onClick={() => setReponiendo(true)}>
                  Reponer stock
                </button>
              </div>
            </>
          ) : (
            <p className={styles.newProductNote}>
              Vas a poder cargar la foto y reponer stock una vez que crees el producto.
            </p>
          )}
        </div>

        <form id="producto-form" className={styles.formCard} onSubmit={handleSubmit}>
          <label>
            Código
            <input
              value={form.codigoProducto}
              onChange={(e) => updateForm('codigoProducto', e.target.value)}
              required
              disabled={editando}
            />
          </label>
          <label>
            Nombre
            <input value={form.nombre} onChange={(e) => updateForm('nombre', e.target.value)} required />
          </label>
          <label>
            Descripción (opcional)
            <textarea
              value={form.descripcion}
              onChange={(e) => updateForm('descripcion', e.target.value)}
              rows={3}
              maxLength={500}
            />
          </label>
          <div className={styles.formRow2}>
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
              {categoriaNombre && (
                <div style={{ marginTop: 6 }}>
                  <CategoryTag label={categoriaNombre} />
                </div>
              )}
            </label>
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
          </div>
          <div className={styles.formRow2}>
            <label>
              Precio de compra
              <input value={form.precioCompra} onChange={(e) => handlePrecioCompraChange(e.target.value)} required />
            </label>
            <label>
              Precio de venta
              <input
                className={styles.priceInput}
                value={form.precioVenta}
                onChange={(e) => {
                  setVentaTocada(true)
                  updateForm('precioVenta', e.target.value)
                }}
                required
              />
            </label>
          </div>
          <p className={styles.formHint}>
            El precio de venta se sugiere solo a partir del precio de compra y el % de la categoría — podés cambiarlo
            cuando quieras.
          </p>
          <label>
            Cantidad en stock
            <input value={form.cantidad} onChange={(e) => updateForm('cantidad', e.target.value)} />
          </label>
          {editando && (
            <p className={styles.formHint}>
              Para sumar unidades por una compra nueva, usá "Reponer stock" en vez de editar este número a mano.
            </p>
          )}
          <label>
            Stock mínimo
            <input value={form.stockMinimo} onChange={(e) => updateForm('stockMinimo', e.target.value)} />
          </label>
        </form>
      </div>

      {reponiendo && producto && (
        <Modal title={`Reponer stock de ${producto.nombre}`} onClose={() => setReponiendo(false)}>
          <form onSubmit={handleReponerStock}>
            <p className={styles.formHint} style={{ marginTop: 0, fontSize: 13 }}>
              Stock actual: {producto.cantidad} unidades
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
