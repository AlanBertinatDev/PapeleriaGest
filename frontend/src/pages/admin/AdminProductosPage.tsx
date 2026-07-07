import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { productosApi, type ProductoResponse } from '../../api/productos'
import { ApiError } from '../../api/client'
import { Modal } from '../../components/Modal'
import { AuthImage } from '../../components/AuthImage'
import { CategoriasMarcasPanel } from './CategoriasMarcasPanel'
import { PageHeader } from '../../components/PageHeader'
import { FilterPills } from '../../components/FilterPills'
import { CategoryTag } from '../../components/CategoryTag'
import { categoryBorderColor, categoryTintColor } from '../../lib/categoryColor'
import styles from './AdminProductosPage.module.css'

type Tab = 'productos' | 'categorias' | 'inactivos'

export function AdminProductosPage() {
  const [tab, setTab] = useState<Tab>('productos')
  const [productos, setProductos] = useState<ProductoResponse[]>([])
  const [inactivos, setInactivos] = useState<ProductoResponse[]>([])
  const [error, setError] = useState<string | null>(null)
  const [reponiendo, setReponiendo] = useState<ProductoResponse | null>(null)
  const [cantidadAReponer, setCantidadAReponer] = useState('')
  const fileInputsRef = useRef<Record<number, HTMLInputElement | null>>({})

  function cargar() {
    productosApi.listar().then(setProductos).catch(() => {})
    productosApi.listarInactivos().then(setInactivos).catch(() => {})
  }

  useEffect(cargar, [])

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
      <PageHeader title="Productos" subtitle="Catálogo de venta de la papelería" />

      <div className={styles.topRow}>
        <FilterPills
          options={[
            { key: 'productos', label: 'Productos' },
            { key: 'inactivos', label: 'Inactivos', count: inactivos.length },
            { key: 'categorias', label: 'Categorías y marcas' },
          ]}
          active={tab}
          onChange={(key) => setTab(key as Tab)}
        />
        {tab === 'productos' && (
          <Link to="/admin/productos/nuevo">
            <button>+ Agregar producto</button>
          </Link>
        )}
      </div>

      {tab === 'categorias' && <CategoriasMarcasPanel />}

      {tab === 'inactivos' && (
        <>
          {error && <p className="error">{error}</p>}
          {inactivos.length === 0 && <p className="empty-state">No hay productos desactivados.</p>}
          <div className="tile-grid">
            {inactivos.map((p) => (
              <div
                className="tile-card"
                key={p.codigoProducto}
                style={{ borderTopColor: categoryBorderColor(p.categoria.nombre) }}
              >
                <div className="tile-image-wrap" style={{ background: categoryTintColor(p.categoria.nombre) }}>
                  {p.tieneImagen ? (
                    <AuthImage src={`/productos/${p.codigoProducto}/imagen`} alt={p.nombre} />
                  ) : (
                    <div className="image-placeholder" aria-label="Sin foto" />
                  )}
                </div>
                <div className="tile-body">
                  <div className={styles.priceRow}>
                    <div className="tile-title">{p.nombre}</div>
                    <CategoryTag label={p.categoria.nombre} />
                  </div>
                  <div className="tile-meta">{p.marca && p.marca.nombre}</div>
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
          {error && !reponiendo && <p className="error">{error}</p>}

          <div className="tile-grid">
            {productos.map((p) => (
              <div
                className="tile-card"
                key={p.codigoProducto}
                style={{ borderTopColor: categoryBorderColor(p.categoria.nombre) }}
              >
                <button
                  className="tile-image-wrap"
                  onClick={() => fileInputsRef.current[p.codigoProducto]?.click()}
                  type="button"
                  aria-label={p.tieneImagen ? 'Cambiar foto' : 'Agregar foto'}
                  style={{ background: categoryTintColor(p.categoria.nombre) }}
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
                  <div className={styles.priceRow}>
                    <div className="tile-title">{p.nombre}</div>
                    <CategoryTag label={p.categoria.nombre} />
                  </div>
                  <div className="tile-meta">{p.marca && p.marca.nombre}</div>
                  <div className={styles.priceRow}>
                    <div className="tile-price">${p.precioVenta}</div>
                    <span className={p.stockBajo ? `${styles.stockBadge} ${styles.bajo}` : styles.stockBadge}>
                      Stock: {p.cantidad}
                    </span>
                  </div>
                  <div className="tile-actions">
                    <button className="secondary" onClick={() => setReponiendo(p)}>
                      Reponer stock
                    </button>
                    <Link to={`/admin/productos/${p.codigoProducto}`} style={{ flex: 1 }}>
                      <button style={{ width: '100%' }}>Editar</button>
                    </Link>
                  </div>
                  <button className={styles.desactivarLink} onClick={() => handleDesactivar(p.codigoProducto)}>
                    Desactivar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {reponiendo && (
        <Modal title={`Reponer stock de ${reponiendo.nombre}`} onClose={cerrarReponer}>
          <form onSubmit={handleReponerStock}>
            <p className={styles.formHint} style={{ marginTop: 0, fontSize: 13 }}>
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
