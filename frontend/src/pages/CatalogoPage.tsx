import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { productosApi, type ProductoResponse } from '../api/productos'
import { ofertasApi, type OfertaResponse } from '../api/ofertas'
import { pedidosApi, type PedidoItemRequest, type TarifasResponse } from '../api/pedidos'
import { documentosApi, type DocumentoResponse } from '../api/documentos'
import { cursosApi, type CursoResponse } from '../api/cursos'
import { ApiError } from '../api/client'
import { AuthImage } from '../components/AuthImage'
import { PageHeader } from '../components/PageHeader'
import { Modal } from '../components/Modal'
import { categoryBadgeColor, categoryBorderColor, categoryTextColor, categoryTintColor } from '../lib/categoryColor'
import styles from './CatalogoPage.module.css'

type FiltroTipo = 'todo' | 'productos' | 'ofertas' | 'servicios'

interface CatalogItem {
  key: string
  nombre: string
  precio: number
  precioOriginal: number | null
  tag: string
  badge: string | null
  sinStock: boolean
  stockDisponible: number | null
  imagenSrc: string | null
  filtroTipo: 'productos' | 'ofertas' | 'servicios'
  productoId?: number
  ofertaId?: number
}

interface DocumentoLinea {
  key: string
  documentoOrigenId: number
  nombre: string
  cantidadCopias: number
  esDobleFaz: boolean
  aColor: boolean
}

function tagLabel(oferta: OfertaResponse): string {
  if (oferta.tipo === 'SERVICIO') return 'Servicio'
  const categoria = oferta.productos[0]?.categoria.nombre ?? 'Producto'
  return oferta.tipo === 'PACK' ? `Pack · ${categoria}` : categoria
}

function itemsDeProductos(productos: ProductoResponse[]): CatalogItem[] {
  return productos.map((p) => ({
    key: `producto-${p.codigoProducto}`,
    nombre: p.nombre,
    precio: Number(p.precioVenta),
    precioOriginal: null,
    tag: p.categoria.nombre,
    badge: null,
    sinStock: p.cantidad <= 0,
    stockDisponible: p.cantidad,
    imagenSrc: p.tieneImagen ? `/productos/${p.codigoProducto}/imagen` : null,
    filtroTipo: 'productos',
    productoId: p.codigoProducto,
  }))
}

function itemsDeOfertas(ofertas: OfertaResponse[]): CatalogItem[] {
  return ofertas.map((o) => {
    const tag = tagLabel(o)
    const precioOriginal = o.tipo !== 'SERVICIO' ? o.productos.reduce((sum, p) => sum + Number(p.precioVenta), 0) : 0
    const precio = Number(o.precio)
    const tieneDescuento = precioOriginal > 0 && precio > 0 && precioOriginal > precio
    const badge = o.tipo === 'SERVICIO' ? 'Servicio' : o.tipo === 'PACK' ? 'Oferta · Pack' : 'Oferta'
    return {
      key: `oferta-${o.id}`,
      nombre: o.titulo,
      precio,
      precioOriginal: tieneDescuento ? precioOriginal : null,
      tag,
      badge,
      sinStock: false,
      stockDisponible: null,
      imagenSrc: o.tieneImagen
        ? `/ofertas/${o.id}/imagen`
        : o.productos[0]?.tieneImagen
          ? `/productos/${o.productos[0].codigoProducto}/imagen`
          : null,
      filtroTipo: o.tipo === 'SERVICIO' ? 'servicios' : 'ofertas',
      ofertaId: o.id,
    }
  })
}

function Stepper({
  cantidad,
  max,
  onChange,
}: {
  cantidad: number
  max: number | null
  onChange: (cantidad: number) => void
}) {
  return (
    <div className={styles.stepper}>
      <button
        type="button"
        className={styles.stepperBtn}
        disabled={cantidad <= 0}
        onClick={() => onChange(Math.max(0, cantidad - 1))}
      >
        −
      </button>
      <span className={styles.stepperValue}>{cantidad}</span>
      <button
        type="button"
        className={styles.stepperBtnAdd}
        disabled={max !== null && cantidad >= max}
        onClick={() => onChange(cantidad + 1)}
      >
        +
      </button>
    </div>
  )
}

function CatalogCard({
  item,
  cantidad,
  onChange,
}: {
  item: CatalogItem
  cantidad: number
  onChange: (cantidad: number) => void
}) {
  const badgeText = item.sinStock ? 'Sin stock' : item.badge
  const badgeClass = item.sinStock ? styles.badgeSinStock : styles.badge

  return (
    <div className={item.sinStock ? `${styles.card} ${styles.cardSinStock}` : styles.card}>
      <div
        className={styles.cardImage}
        style={{
          borderTopColor: item.sinStock ? 'oklch(0.7 0.03 20)' : categoryBorderColor(item.tag),
          background: item.sinStock ? 'oklch(0.94 0.006 75)' : categoryTintColor(item.tag, 0.96, 0.02),
        }}
      >
        {item.imagenSrc && !item.sinStock ? (
          <AuthImage src={item.imagenSrc} alt={item.nombre} />
        ) : (
          <div className={styles.cardImageStripe} />
        )}
        {badgeText && (
          <span
            className={badgeClass}
            style={!item.sinStock ? { background: categoryBadgeColor(item.tag) } : undefined}
          >
            {badgeText}
          </span>
        )}
      </div>
      <div className={styles.cardBody}>
        <div className={item.sinStock ? `${styles.cardTitle} ${styles.cardTitleMuted}` : styles.cardTitle}>
          {item.nombre}
        </div>
        <div className={styles.cardFooter}>
          <div className={styles.cardPriceRow}>
            {item.precioOriginal && <span className={styles.cardOriginal}>${item.precioOriginal}</span>}
            <span className={item.sinStock ? `${styles.cardPromo} ${styles.cardPromoMuted}` : styles.cardPromo}>
              ${item.precio}
            </span>
          </div>
          {item.sinStock ? (
            <span className={styles.agotadoBtn}>Agotado</span>
          ) : (
            <Stepper cantidad={cantidad} max={item.stockDisponible} onChange={onChange} />
          )}
        </div>
      </div>
    </div>
  )
}

function DocumentoPickerModal({
  onClose,
  onAdd,
}: {
  onClose: () => void
  onAdd: (linea: Omit<DocumentoLinea, 'key'>) => void
}) {
  const [tab, setTab] = useState<'mios' | 'curso'>('mios')
  const [misDocumentos, setMisDocumentos] = useState<DocumentoResponse[]>([])
  const [cursos, setCursos] = useState<CursoResponse[]>([])
  const [cursoId, setCursoId] = useState('')
  const [materiales, setMateriales] = useState<DocumentoResponse[]>([])
  const [seleccionado, setSeleccionado] = useState<DocumentoResponse | null>(null)
  const [cantidadCopias, setCantidadCopias] = useState(1)
  const [esDobleFaz, setEsDobleFaz] = useState(false)
  const [aColor, setAColor] = useState(false)

  useEffect(() => {
    documentosApi.misDocumentos().then(setMisDocumentos).catch(() => {})
    cursosApi.listar().then(setCursos).catch(() => {})
  }, [])

  function handleBuscarCurso(id: string) {
    setCursoId(id)
    if (!id) {
      setMateriales([])
      return
    }
    documentosApi
      .listarPorCurso(Number(id))
      .then(setMateriales)
      .catch(() => {})
  }

  const lista = tab === 'mios' ? misDocumentos : materiales

  if (seleccionado) {
    return (
      <Modal title={`Imprimir "${seleccionado.nombre}"`} onClose={onClose}>
        <div className={styles.pickerForm}>
          <label>
            Cantidad de copias
            <input
              type="number"
              min={1}
              value={cantidadCopias}
              onChange={(e) => setCantidadCopias(Number(e.target.value))}
            />
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={esDobleFaz} onChange={(e) => setEsDobleFaz(e.target.checked)} />
            Doble faz
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={aColor} onChange={(e) => setAColor(e.target.checked)} />A color
          </label>
          <div className={styles.pickerFormActions}>
            <button type="button" className="secondary" onClick={() => setSeleccionado(null)}>
              Volver
            </button>
            <button
              type="button"
              onClick={() =>
                onAdd({
                  documentoOrigenId: seleccionado.id,
                  nombre: seleccionado.nombre,
                  cantidadCopias,
                  esDobleFaz,
                  aColor,
                })
              }
            >
              Agregar al pedido
            </button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="Agregar documento a imprimir" onClose={onClose}>
      <div className={styles.pickerTabs}>
        <button
          type="button"
          className={tab === 'mios' ? `${styles.pickerTab} ${styles.pickerTabActive}` : styles.pickerTab}
          onClick={() => setTab('mios')}
        >
          Mis documentos
        </button>
        <button
          type="button"
          className={tab === 'curso' ? `${styles.pickerTab} ${styles.pickerTabActive}` : styles.pickerTab}
          onClick={() => setTab('curso')}
        >
          Material de un curso
        </button>
      </div>

      {tab === 'curso' && (
        <label>
          Curso
          <select value={cursoId} onChange={(e) => handleBuscarCurso(e.target.value)}>
            <option value="">Seleccioná un curso</option>
            {cursos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.grado} {c.grupo}
              </option>
            ))}
          </select>
        </label>
      )}

      {lista.length === 0 ? (
        <p className="empty-state">
          {tab === 'mios' ? 'Todavía no cargaste ningún documento propio.' : 'Elegí un curso para ver sus materiales.'}
        </p>
      ) : (
        <div className={styles.pickerList}>
          {lista.map((doc) => (
            <button
              type="button"
              key={doc.id}
              className={styles.pickerListItem}
              onClick={() => {
                setSeleccionado(doc)
                setCantidadCopias(1)
                setEsDobleFaz(false)
                setAColor(false)
              }}
            >
              {doc.nombre}
              {doc.materia && <span className={styles.pickerListMeta}> · {doc.materia}</span>}
            </button>
          ))}
        </div>
      )}
    </Modal>
  )
}

export function CatalogoPage() {
  const [productos, setProductos] = useState<ProductoResponse[]>([])
  const [ofertas, setOfertas] = useState<OfertaResponse[]>([])
  const [cantidades, setCantidades] = useState<Record<string, number>>({})
  const [documentos, setDocumentos] = useState<DocumentoLinea[]>([])
  const [tarifas, setTarifas] = useState<TarifasResponse | null>(null)
  const [esEnvio, setEsEnvio] = useState(false)
  const [direccion, setDireccion] = useState('')
  const [filtro, setFiltro] = useState<FiltroTipo>('todo')
  const [pickerAbierto, setPickerAbierto] = useState(false)
  const [revisando, setRevisando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [creando, setCreando] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    productosApi
      .listar()
      .then(setProductos)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'No se pudo cargar el catálogo'))
    ofertasApi
      .listarVigentes()
      .then(setOfertas)
      .catch(() => {})
    pedidosApi
      .tarifas()
      .then(setTarifas)
      .catch(() => {})
  }, [])

  const items = useMemo(
    () => [...itemsDeProductos(productos), ...itemsDeOfertas(ofertas)],
    [productos, ofertas],
  )
  const itemsPorKey = useMemo(() => new Map(items.map((i) => [i.key, i])), [items])
  const visibles = filtro === 'todo' ? items : items.filter((i) => i.filtroTipo === filtro)

  function setCantidad(key: string, cantidad: number) {
    setCantidades((prev) => ({ ...prev, [key]: cantidad }))
  }

  function agregarDocumento(linea: Omit<DocumentoLinea, 'key'>) {
    setDocumentos((prev) => [...prev, { ...linea, key: `doc-${linea.documentoOrigenId}-${Date.now()}` }])
    setPickerAbierto(false)
  }

  function quitarDocumento(key: string) {
    setDocumentos((prev) => prev.filter((d) => d.key !== key))
  }

  const lineas = Object.entries(cantidades)
    .filter(([, cantidad]) => cantidad > 0)
    .map(([key, cantidad]) => ({ item: itemsPorKey.get(key), cantidad }))
    .filter((linea): linea is { item: CatalogItem; cantidad: number } => linea.item !== undefined)

  function precioCopia(aColor: boolean): number {
    if (!tarifas) return 0
    return Number(aColor ? tarifas.costoCopiaColor : tarifas.costoCopiaBn)
  }

  const subtotalItems = lineas.reduce((acc, linea) => acc + linea.cantidad * linea.item.precio, 0)
  const subtotalDocumentos = documentos.reduce((acc, doc) => acc + doc.cantidadCopias * precioCopia(doc.aColor), 0)
  const costoEnvio = esEnvio && tarifas ? Number(tarifas.costoEnvio) : 0
  const total = subtotalItems + subtotalDocumentos + costoEnvio

  const hayItems = lineas.length > 0 || documentos.length > 0

  function abrirRevision() {
    if (!hayItems) {
      setError('Agregá al menos un ítem con cantidad mayor a 0')
      return
    }
    if (esEnvio && !direccion.trim()) {
      setError('Ingresá una dirección de envío')
      return
    }
    setError(null)
    setRevisando(true)
  }

  async function handleConfirmar() {
    const requestItems: PedidoItemRequest[] = lineas.map(({ item, cantidad }) =>
      item.productoId !== undefined
        ? { productoId: item.productoId, cantidad }
        : { ofertaId: item.ofertaId, cantidad },
    )

    setError(null)
    setCreando(true)
    try {
      const pedido = await pedidosApi.crear({
        esEnvio,
        direccion: esEnvio ? direccion : null,
        items: requestItems,
      })
      for (const doc of documentos) {
        await documentosApi.solicitarImpresion({
          documentoOrigenId: doc.documentoOrigenId,
          pedidoId: pedido.id,
          cantidadCopias: doc.cantidadCopias,
          esDobleFaz: doc.esDobleFaz,
          aColor: doc.aColor,
        })
      }
      navigate('/mis-pedidos', { state: { creado: pedido.id } })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear el pedido')
    } finally {
      setCreando(false)
    }
  }

  return (
    <div>
      <PageHeader title="Catálogo" subtitle="Armá tu pedido con productos, servicios y ofertas de la papelería" />
      {error && !revisando && <p className="error">{error}</p>}

      <div className={styles.filterPills}>
        {(
          [
            { key: 'todo', label: 'Todo' },
            { key: 'productos', label: 'Productos' },
            { key: 'ofertas', label: 'Ofertas' },
            { key: 'servicios', label: 'Servicios' },
          ] as const
        ).map((opt) => (
          <button
            key={opt.key}
            type="button"
            className={filtro === opt.key ? `${styles.pill} ${styles.pillActive}` : styles.pill}
            onClick={() => setFiltro(opt.key)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {productos.length === 0 && ofertas.length === 0 ? (
        <p className="empty-state">Todavía no hay nada cargado en el catálogo.</p>
      ) : (
        <div className={styles.layout}>
          <div className={styles.grid}>
            {visibles.map((item) => (
              <CatalogCard
                key={item.key}
                item={item}
                cantidad={cantidades[item.key] ?? 0}
                onChange={(cantidad) => setCantidad(item.key, cantidad)}
              />
            ))}
          </div>

          <aside className={styles.summary}>
            <div className={styles.summaryTitle}>Tu pedido</div>

            {!hayItems ? (
              <p className="empty-state">Todavía no agregaste productos.</p>
            ) : (
              <>
                {lineas.map(({ item, cantidad }) => (
                  <div className={styles.summaryLine} key={item.key}>
                    <div>
                      <div className={styles.summaryLineName}>
                        {item.nombre}
                        {item.badge && (
                          <span className={styles.summaryTag} style={{ color: categoryTextColor(item.tag) }}>
                            {item.badge === 'Servicio' ? 'Servicio' : 'Oferta'}
                          </span>
                        )}
                      </div>
                      <div className={styles.summaryLineQty}>
                        {cantidad} × ${item.precio}
                      </div>
                    </div>
                    <span className={styles.summarySubtotal}>${(cantidad * item.precio).toFixed(2)}</span>
                  </div>
                ))}

                {documentos.map((doc) => (
                  <div className={styles.summaryLine} key={doc.key}>
                    <div>
                      <div className={styles.summaryLineName}>
                        {doc.nombre}
                        <span className={styles.summaryTag} style={{ color: categoryTextColor('Servicio') }}>
                          Impresión
                        </span>
                      </div>
                      <div className={styles.summaryLineQty}>
                        {doc.cantidadCopias} copia{doc.cantidadCopias === 1 ? '' : 's'} × $
                        {precioCopia(doc.aColor).toFixed(2)}
                      </div>
                    </div>
                    <div className={styles.summaryLineActions}>
                      <span className={styles.summarySubtotal}>
                        ${(doc.cantidadCopias * precioCopia(doc.aColor)).toFixed(2)}
                      </span>
                      <button type="button" className={styles.removeLineBtn} onClick={() => quitarDocumento(doc.key)}>
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

            <button type="button" className={styles.addDocBtn} onClick={() => setPickerAbierto(true)}>
              + Agregar documento a imprimir
            </button>

            <div className={styles.envioBlock}>
              <div className={styles.envioTitle}>Entrega</div>
              <div className={styles.envioToggle}>
                <button
                  type="button"
                  className={!esEnvio ? `${styles.envioBtn} ${styles.envioBtnActive}` : styles.envioBtn}
                  onClick={() => setEsEnvio(false)}
                >
                  Retiro en el local
                </button>
                <button
                  type="button"
                  className={esEnvio ? `${styles.envioBtn} ${styles.envioBtnActive}` : styles.envioBtn}
                  onClick={() => setEsEnvio(true)}
                >
                  Envío a domicilio
                </button>
              </div>
              {esEnvio && (
                <input
                  className={styles.envioInput}
                  placeholder="Dirección de envío"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                />
              )}
            </div>

            {esEnvio && (
              <div className={styles.summaryLine}>
                <span className={styles.summaryLineName}>Costo de envío</span>
                <span className={styles.summarySubtotal}>${costoEnvio.toFixed(2)}</span>
              </div>
            )}

            <div className={styles.summaryTotal}>
              <span>Total estimado</span>
              <span className={styles.summaryTotalValue}>${total.toFixed(2)}</span>
            </div>
            <button className={styles.crearBtn} onClick={abrirRevision} disabled={creando || !hayItems}>
              Revisar pedido
            </button>
          </aside>
        </div>
      )}

      {pickerAbierto && (
        <DocumentoPickerModal onClose={() => setPickerAbierto(false)} onAdd={agregarDocumento} />
      )}

      {revisando && (
        <Modal title="Confirmá tu pedido" onClose={() => setRevisando(false)}>
          <div className={styles.reviewList}>
            {lineas.map(({ item, cantidad }) => (
              <div className={styles.summaryLine} key={item.key}>
                <div>
                  <div className={styles.summaryLineName}>
                    {item.nombre}
                    {item.badge && (
                      <span className={styles.summaryTag} style={{ color: categoryTextColor(item.tag) }}>
                        {item.badge === 'Servicio' ? 'Servicio' : 'Oferta'}
                      </span>
                    )}
                  </div>
                  <div className={styles.summaryLineQty}>
                    {cantidad} × ${item.precio}
                  </div>
                </div>
                <span className={styles.summarySubtotal}>${(cantidad * item.precio).toFixed(2)}</span>
              </div>
            ))}
            {documentos.map((doc) => (
              <div className={styles.summaryLine} key={doc.key}>
                <div>
                  <div className={styles.summaryLineName}>
                    {doc.nombre} <span className={styles.summaryTag}>Impresión</span>
                  </div>
                  <div className={styles.summaryLineQty}>
                    {doc.cantidadCopias} copia{doc.cantidadCopias === 1 ? '' : 's'}
                  </div>
                </div>
                <span className={styles.summarySubtotal}>
                  ${(doc.cantidadCopias * precioCopia(doc.aColor)).toFixed(2)}
                </span>
              </div>
            ))}
            <div className={styles.summaryLine}>
              <span className={styles.summaryLineName}>
                {esEnvio ? `Envío a: ${direccion}` : 'Retiro en el local'}
              </span>
              {esEnvio && <span className={styles.summarySubtotal}>${costoEnvio.toFixed(2)}</span>}
            </div>
          </div>

          <div className={styles.summaryTotal}>
            <span>Total</span>
            <span className={styles.summaryTotalValue}>${total.toFixed(2)}</span>
          </div>

          {error && <p className="error">{error}</p>}

          <div className={styles.reviewActions}>
            <button type="button" className="secondary" onClick={() => setRevisando(false)} disabled={creando}>
              Seguir editando
            </button>
            <button type="button" onClick={handleConfirmar} disabled={creando}>
              {creando ? 'Confirmando...' : 'Confirmar pedido'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
