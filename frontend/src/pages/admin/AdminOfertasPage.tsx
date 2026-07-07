import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ofertasApi, type AudienciaNotificacion, type OfertaResponse, type TipoOferta } from '../../api/ofertas'
import { productosApi, type ProductoResponse } from '../../api/productos'
import { ApiError, obtenerImagenComoObjectUrl } from '../../api/client'
import { EstadoBadge } from '../../components/EstadoBadge'
import { Modal } from '../../components/Modal'
import { AuthImage } from '../../components/AuthImage'
import { PageHeader } from '../../components/PageHeader'
import { CategoryTag } from '../../components/CategoryTag'
import { FilterPills } from '../../components/FilterPills'
import { Toggle } from '../../components/Toggle'
import { ImageDropzone } from '../../components/ImageDropzone'
import { DiscountPreview } from '../../components/DiscountPreview'
import { categoryBorderColor, categoryTintColor } from '../../lib/categoryColor'
import styles from './AdminOfertasPage.module.css'

type Tab = 'activas' | 'programadas' | 'vencidas'

const TIPO_ICONO: Record<TipoOferta, string> = {
  PRODUCTO: '📦',
  PACK: '🎁',
  SERVICIO: '✂️',
}

function tagLabel(oferta: OfertaResponse): string {
  if (oferta.tipo === 'SERVICIO') return 'Servicio'
  const categoria = oferta.productos[0]?.categoria.nombre ?? 'Producto'
  return oferta.tipo === 'PACK' ? `Pack · ${categoria}` : categoria
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function AdminOfertasPage() {
  const [ofertas, setOfertas] = useState<OfertaResponse[]>([])
  const [productos, setProductos] = useState<ProductoResponse[]>([])
  const [tab, setTab] = useState<Tab>('activas')
  const [error, setError] = useState<string | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<OfertaResponse | null>(null)
  const [guardando, setGuardando] = useState(false)

  const [tipo, setTipo] = useState<TipoOferta>('PRODUCTO')
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [precio, setPrecio] = useState('')
  const [productoIds, setProductoIds] = useState<number[]>([])
  const [imagenFile, setImagenFile] = useState<File | null>(null)
  const [imagenPreviewUrl, setImagenPreviewUrl] = useState<string | null>(null)
  const [publicarAhora, setPublicarAhora] = useState(true)
  const [fechaDesde, setFechaDesde] = useState(today())
  const [fechaHasta, setFechaHasta] = useState('')
  const [notificarPorCorreo, setNotificarPorCorreo] = useState(false)
  const [audienciaNotificacion, setAudienciaNotificacion] = useState<AudienciaNotificacion | null>(null)
  const [destacarHome, setDestacarHome] = useState(false)

  function cargar() {
    ofertasApi
      .listarTodas()
      .then(setOfertas)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'No se pudieron cargar las ofertas'))
    productosApi.listar().then(setProductos).catch(() => {})
  }

  useEffect(cargar, [])

  const precioOriginal = useMemo(() => {
    if (tipo === 'SERVICIO' || productoIds.length === 0) return null
    const seleccionados = productos.filter((p) => productoIds.includes(p.codigoProducto))
    if (seleccionados.length === 0) return null
    return seleccionados.reduce((sum, p) => sum + Number(p.precioVenta), 0)
  }, [tipo, productoIds, productos])

  function abrirNueva() {
    setEditando(null)
    setTipo('PRODUCTO')
    setTitulo('')
    setDescripcion('')
    setPrecio('')
    setProductoIds([])
    setImagenFile(null)
    setImagenPreviewUrl(null)
    setPublicarAhora(true)
    setFechaDesde(today())
    setFechaHasta('')
    setNotificarPorCorreo(false)
    setAudienciaNotificacion(null)
    setDestacarHome(false)
    setError(null)
    setModalAbierto(true)
  }

  function abrirEditar(oferta: OfertaResponse) {
    setEditando(oferta)
    setTipo(oferta.tipo)
    setTitulo(oferta.titulo)
    setDescripcion(oferta.descripcion ?? '')
    setPrecio(oferta.precio)
    setProductoIds(oferta.productos.map((p) => p.codigoProducto))
    setImagenFile(null)
    setImagenPreviewUrl(null)
    if (oferta.tieneImagen) {
      obtenerImagenComoObjectUrl(`/ofertas/${oferta.id}/imagen`).then(setImagenPreviewUrl).catch(() => {})
    }
    setPublicarAhora(oferta.fechaDesde <= today())
    setFechaDesde(oferta.fechaDesde)
    setFechaHasta(oferta.fechaHasta)
    setNotificarPorCorreo(false)
    setAudienciaNotificacion(oferta.audienciaNotificacion)
    setDestacarHome(oferta.destacarHome)
    setError(null)
    setModalAbierto(true)
  }

  function cerrarModal() {
    setModalAbierto(false)
    setError(null)
  }

  function cambiarTipo(nuevo: TipoOferta) {
    setTipo(nuevo)
    setProductoIds([])
    if (nuevo === 'SERVICIO') {
      setAudienciaNotificacion((prev) => (prev === 'CATEGORIA' ? null : prev))
    }
  }

  function toggleProducto(codigo: number) {
    setProductoIds((prev) => {
      if (tipo === 'PRODUCTO') {
        return prev.includes(codigo) ? [] : [codigo]
      }
      return prev.includes(codigo) ? prev.filter((id) => id !== codigo) : [...prev, codigo]
    })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setGuardando(true)
    try {
      const data = {
        titulo,
        descripcion: descripcion || null,
        precio,
        fechaDesde: publicarAhora ? today() : fechaDesde,
        fechaHasta,
        tipo,
        productoIds,
        notificarPorCorreo,
        audienciaNotificacion: notificarPorCorreo ? audienciaNotificacion : null,
        destacarHome,
      }
      const resultado = editando ? await ofertasApi.actualizar(editando.id, data) : await ofertasApi.crear(data)
      if (imagenFile) {
        await ofertasApi.subirImagen(resultado.id, imagenFile)
      }
      cerrarModal()
      cargar()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar la oferta')
    } finally {
      setGuardando(false)
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

  const hoy = today()
  const activas = ofertas.filter((o) => o.fechaDesde <= hoy && o.fechaHasta >= hoy)
  const programadas = ofertas.filter((o) => o.fechaDesde > hoy)
  const vencidas = ofertas.filter((o) => o.fechaHasta < hoy)
  const visibles = tab === 'activas' ? activas : tab === 'programadas' ? programadas : vencidas

  return (
    <div>
      <PageHeader
        title="Ofertas"
        subtitle="Promociones de productos, packs y servicios"
        action={<button onClick={abrirNueva}>+ Nueva oferta</button>}
      />
      {error && !modalAbierto && <p className="error">{error}</p>}

      <FilterPills
        options={[
          { key: 'activas', label: 'Activas', count: activas.length },
          { key: 'programadas', label: 'Programadas', count: programadas.length },
          { key: 'vencidas', label: 'Vencidas', count: vencidas.length },
        ]}
        active={tab}
        onChange={(key) => setTab(key as Tab)}
      />

      {visibles.length === 0 && <p className="empty-state">No hay ofertas en este estado.</p>}

      <div className={styles.list}>
        {visibles.map((oferta) => {
          const tag = tagLabel(oferta)
          return (
            <div className={styles.card} key={oferta.id} style={{ borderLeftColor: categoryBorderColor(tag) }}>
              <div className={styles.thumb} style={{ background: categoryTintColor(tag) }}>
                {oferta.tieneImagen ? (
                  <AuthImage src={`/ofertas/${oferta.id}/imagen`} alt={oferta.titulo} />
                ) : oferta.productos[0]?.tieneImagen ? (
                  <AuthImage src={`/productos/${oferta.productos[0].codigoProducto}/imagen`} alt={oferta.titulo} />
                ) : (
                  TIPO_ICONO[oferta.tipo]
                )}
              </div>
              <div className={styles.info}>
                <div className={styles.titleRow}>
                  <span className={styles.name}>{oferta.titulo}</span>
                  <CategoryTag label={tag} />
                </div>
                <div className={styles.vigencia}>
                  Vigente del {oferta.fechaDesde} al {oferta.fechaHasta}
                </div>
              </div>
              <div className={oferta.notificado ? styles.notificacion : `${styles.notificacion} ${styles.no}`}>
                {oferta.notificado
                  ? `📧 Enviado a ${oferta.notificadoCantidad} cliente${oferta.notificadoCantidad === 1 ? '' : 's'}`
                  : '📧 No notificado'}
              </div>
              <div className={styles.price}>${oferta.precio}</div>
              <EstadoBadge estado={oferta.activo ? 'Activa' : 'Inactiva'} />
              <div className={styles.actions}>
                <button className="secondary" onClick={() => abrirEditar(oferta)}>
                  Editar
                </button>
                <button className={styles.eliminarBtn} onClick={() => handleEliminar(oferta.id)}>
                  Eliminar
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {modalAbierto && (
        <Modal title={editando ? `Editar ${editando.titulo}` : 'Nueva oferta'} onClose={cerrarModal} wide>
          <form onSubmit={handleSubmit}>
            <div className={styles.tipoSection}>
              <label>Tipo de oferta</label>
              <FilterPills
                options={[
                  { key: 'PRODUCTO', label: `${TIPO_ICONO.PRODUCTO} Producto` },
                  { key: 'PACK', label: `${TIPO_ICONO.PACK} Pack de productos` },
                  { key: 'SERVICIO', label: `${TIPO_ICONO.SERVICIO} Servicio` },
                ]}
                active={tipo}
                onChange={(key) => cambiarTipo(key as TipoOferta)}
              />
            </div>

            <div className={styles.modalGrid}>
              <div className={styles.leftCol}>
                <ImageDropzone previewUrl={imagenPreviewUrl} onFileSelected={(f) => {
                  setImagenFile(f)
                  setImagenPreviewUrl(URL.createObjectURL(f))
                }} />

                {tipo !== 'SERVICIO' && (
                  <div>
                    <label>{tipo === 'PACK' ? 'Productos' : 'Producto'}</label>
                    <div className="checkbox-list">
                      {productos.map((p) => (
                        <label className="checkbox-row" key={p.codigoProducto}>
                          <input
                            type={tipo === 'PRODUCTO' ? 'radio' : 'checkbox'}
                            name="producto-oferta"
                            checked={productoIds.includes(p.codigoProducto)}
                            onChange={() => toggleProducto(p.codigoProducto)}
                          />
                          {p.nombre} — ${p.precioVenta}
                        </label>
                      ))}
                      {productos.length === 0 && <p className="empty-state">No hay productos cargados todavía.</p>}
                    </div>
                  </div>
                )}

                <DiscountPreview
                  precioOriginal={precioOriginal}
                  precioPromocional={precio ? Number(precio) : null}
                />
              </div>

              <div className={styles.rightCol}>
                <label>
                  Título
                  <input
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ej: 30% en cuadernolas por vuelta al cole"
                    required
                  />
                </label>
                <label>
                  Descripción
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Contale al cliente de qué se trata la promo…"
                  />
                </label>
                <div className={styles.formRow2}>
                  <label>
                    Precio original
                    <div className={styles.readonlyValue}>{precioOriginal ? `$${precioOriginal}` : '—'}</div>
                  </label>
                  <label>
                    Precio promocional
                    <input
                      className={styles.precioPromocionalInput}
                      value={precio}
                      onChange={(e) => setPrecio(e.target.value)}
                      required
                    />
                  </label>
                </div>

                <div>
                  <div className={styles.vigenciaHeader}>
                    <span className={styles.vigenciaTitle}>Vigencia</span>
                    <FilterPills
                      options={[
                        { key: 'ahora', label: 'Publicar ahora' },
                        { key: 'programar', label: 'Programar' },
                      ]}
                      active={publicarAhora ? 'ahora' : 'programar'}
                      onChange={(key) => setPublicarAhora(key === 'ahora')}
                    />
                  </div>
                  <div className={styles.formRow2}>
                    <label>
                      Desde
                      <input
                        type="date"
                        value={publicarAhora ? today() : fechaDesde}
                        onChange={(e) => setFechaDesde(e.target.value)}
                        disabled={publicarAhora}
                        required
                      />
                    </label>
                    <label>
                      Hasta
                      <input
                        type="date"
                        value={fechaHasta}
                        onChange={(e) => setFechaHasta(e.target.value)}
                        required
                      />
                    </label>
                  </div>
                </div>

                <div className={styles.notifyBlock}>
                  <div className={styles.notifyHeader}>
                    <div>
                      <div className={styles.notifyTitle}>Mostrar en el home público</div>
                      <div className={styles.notifyHint}>
                        Aparece en el carrusel de ofertas que ven los visitantes sin cuenta
                      </div>
                    </div>
                    <Toggle
                      checked={destacarHome}
                      onChange={() => setDestacarHome((v) => !v)}
                      label="Mostrar en el home público"
                    />
                  </div>
                </div>

                <div className={styles.notifyBlock}>
                  <div className={styles.notifyHeader}>
                    <div>
                      <div className={styles.notifyTitle}>Notificar por correo a clientes</div>
                      <div className={styles.notifyHint}>
                        Se envía un aviso a los destinatarios elegidos al publicar
                      </div>
                    </div>
                    <Toggle
                      checked={notificarPorCorreo}
                      onChange={() => setNotificarPorCorreo((v) => !v)}
                      disabled={!!editando?.notificado}
                      label="Notificar por correo a clientes"
                    />
                  </div>
                  {notificarPorCorreo && (
                    <div className={styles.audienceChips}>
                      <button
                        type="button"
                        className={
                          audienciaNotificacion === 'TODOS'
                            ? `${styles.audienceChip} ${styles.active}`
                            : styles.audienceChip
                        }
                        onClick={() => setAudienciaNotificacion('TODOS')}
                      >
                        Todos los clientes registrados
                      </button>
                      <button
                        type="button"
                        className={
                          audienciaNotificacion === 'CATEGORIA'
                            ? `${styles.audienceChip} ${styles.active}`
                            : styles.audienceChip
                        }
                        onClick={() => setAudienciaNotificacion('CATEGORIA')}
                        disabled={tipo === 'SERVICIO'}
                      >
                        Solo compraron esta categoría
                      </button>
                    </div>
                  )}
                  {editando?.notificado && (
                    <p className={styles.notifyHint} style={{ marginTop: 8 }}>
                      Ya se notificó a los clientes cuando se publicó — editar la oferta no vuelve a enviar el aviso.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {error && <p className="error">{error}</p>}
            <div className={styles.footer}>
              <button type="button" className="secondary" onClick={cerrarModal}>
                Cancelar
              </button>
              <button type="submit" disabled={guardando}>
                {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Publicar oferta'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
