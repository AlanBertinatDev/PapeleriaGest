import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { productosApi, type ProductoResponse } from '../api/productos'
import { ofertasApi, type OfertaResponse } from '../api/ofertas'
import { pedidosApi, type PedidoItemRequest, type TarifasResponse } from '../api/pedidos'
import {
  documentosApi,
  type DocumentoResponse,
  type ModoColor,
  type Tamanio,
  type TipoPapel,
  type PaginasPorCara,
  type Orientacion,
  type Terminacion,
} from '../api/documentos'
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
  descripcion: string | null
  precio: number
  precioOriginal: number | null
  tag: string
  marca: string | null
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
  modoColor: ModoColor
  tamanio: Tamanio
  tipoPapel: TipoPapel
  paginasPorCara: PaginasPorCara
  orientacion: Orientacion
  terminacion: Terminacion
  precio: number
}

function capitalizar(texto: string): string {
  return texto
    .toLowerCase()
    .split(' ')
    .map((palabra) => (palabra ? palabra[0].toUpperCase() + palabra.slice(1) : palabra))
    .join(' ')
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
    descripcion: p.descripcion,
    precio: Number(p.precioVenta),
    precioOriginal: null,
    tag: p.categoria.nombre,
    marca: p.marca?.nombre ?? null,
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
      descripcion: o.descripcion,
      precio,
      precioOriginal: tieneDescuento ? precioOriginal : null,
      tag,
      marca: o.productos[0]?.marca?.nombre ?? null,
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
        {item.descripcion && <p className={styles.cardDescripcion}>{item.descripcion}</p>}
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
  const [modoColor, setModoColor] = useState<ModoColor>('BN')
  const [tamanio, setTamanio] = useState<Tamanio>('A4')
  const [tipoPapel, setTipoPapel] = useState<TipoPapel>('75g')
  const [paginasPorCara, setPaginasPorCara] = useState<PaginasPorCara>('1')
  const [orientacion, setOrientacion] = useState<Orientacion>('VERTICAL')
  const [terminacion, setTerminacion] = useState<Terminacion>('NINGUNA')
  const [precio, setPrecio] = useState(0)

  useEffect(() => {
    documentosApi.misDocumentos().then(setMisDocumentos).catch(() => {})
    cursosApi.listar().then(setCursos).catch(() => {})
  }, [])

  useEffect(() => {
    if (!seleccionado) return
    documentosApi
      .cotizar({ cantidadCopias, modoColor, tamanio, tipoPapel, terminacion })
      .then((res) => setPrecio(Number(res.precio)))
      .catch(() => setPrecio(0))
  }, [seleccionado, cantidadCopias, modoColor, tamanio, tipoPapel, terminacion])

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
              onChange={(e) => setCantidadCopias(Math.max(1, Number(e.target.value)))}
            />
          </label>

          <label>
            Color de impresión
            <select value={modoColor} onChange={(e) => setModoColor(e.target.value as ModoColor)}>
              <option value="BN">Blanco y negro</option>
              <option value="COLOR_LASER">Color láser</option>
              <option value="COLOR_TINTA">Color tinta</option>
            </select>
          </label>

          <label>
            Tamaño de papel
            <select value={tamanio} onChange={(e) => setTamanio(e.target.value as Tamanio)}>
              <option value="A4">A4 (297 × 210 mm)</option>
              <option value="A3">A3 (420 × 297 mm)</option>
              <option value="A5">A5 (210 × 148 mm)</option>
            </select>
          </label>

          <label>
            Tipo de papel
            <select value={tipoPapel} onChange={(e) => setTipoPapel(e.target.value as TipoPapel)}>
              <option value="75g">75g — papel común</option>
              <option value="160g">160g — papel grueso</option>
              <option value="200g">200g — cartulina</option>
              <option value="FOTO">Fotográfico</option>
            </select>
          </label>

          <label>
            Páginas por cara
            <select value={paginasPorCara} onChange={(e) => setPaginasPorCara(e.target.value as PaginasPorCara)}>
              <option value="1">Normal (1 página por cara)</option>
              <option value="2">2 páginas por cara</option>
              <option value="4">4 páginas por cara</option>
            </select>
          </label>

          <label>
            Orientación
            <select value={orientacion} onChange={(e) => setOrientacion(e.target.value as Orientacion)}>
              <option value="VERTICAL">Vertical (retrato)</option>
              <option value="HORIZONTAL">Horizontal (paisaje)</option>
            </select>
          </label>

          <label>
            Terminación
            <select value={terminacion} onChange={(e) => setTerminacion(e.target.value as Terminacion)}>
              <option value="NINGUNA">Sin acabado</option>
              <option value="ENCUADERNACION">Encuadernación</option>
              <option value="GRAPADO">Grapado</option>
              <option value="AGUJEROS">2 agujeros</option>
            </select>
          </label>

          <label className="checkbox-row">
            <input type="checkbox" checked={esDobleFaz} onChange={(e) => setEsDobleFaz(e.target.checked)} />
            Doble faz
          </label>

          <div
            style={{
              background: 'var(--color-primary, #2563eb)',
              color: '#fff',
              borderRadius: '8px',
              padding: '12px 16px',
              margin: '8px 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontWeight: 500 }}>Precio</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>${precio.toFixed(2)}</span>
          </div>

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
                  modoColor,
                  tamanio,
                  tipoPapel,
                  paginasPorCara,
                  orientacion,
                  terminacion,
                  precio,
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
                setModoColor('BN')
                setTamanio('A4')
                setTipoPapel('75g')
                setPaginasPorCara('1')
                setOrientacion('VERTICAL')
                setTerminacion('NINGUNA')
                setPrecio(0)
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
  const [detalle, setDetalle] = useState('')
  const [filtro, setFiltro] = useState<FiltroTipo>('todo')
  const [busqueda, setBusqueda] = useState('')
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>([])
  const [marcasSeleccionadas, setMarcasSeleccionadas] = useState<string[]>([])
  const [precioMax, setPrecioMax] = useState<number | null>(null)
  const [pickerAbierto, setPickerAbierto] = useState(false)
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)
  const [carritoAbierto, setCarritoAbierto] = useState(false)
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

  const categoriasDisponibles = useMemo(
    () => Array.from(new Set(items.map((i) => i.tag))).sort((a, b) => a.localeCompare(b)),
    [items],
  )
  const marcasDisponibles = useMemo(
    () =>
      Array.from(new Set(items.map((i) => i.marca).filter((m): m is string => m !== null))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [items],
  )
  const precioTope = useMemo(() => items.reduce((max, i) => Math.max(max, i.precio), 0), [items])
  const precioMaxActivo = precioMax ?? precioTope

  function toggleCategoria(cat: string) {
    setCategoriasSeleccionadas((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]))
  }

  function toggleMarca(marca: string) {
    setMarcasSeleccionadas((prev) => (prev.includes(marca) ? prev.filter((m) => m !== marca) : [...prev, marca]))
  }

  function limpiarFiltros() {
    setCategoriasSeleccionadas([])
    setMarcasSeleccionadas([])
    setPrecioMax(null)
  }

  const busquedaNormalizada = busqueda.trim().toLowerCase()
  const visibles = items.filter((i) => {
    if (filtro !== 'todo' && i.filtroTipo !== filtro) return false
    if (busquedaNormalizada && !i.nombre.toLowerCase().includes(busquedaNormalizada)) return false
    if (categoriasSeleccionadas.length > 0 && !categoriasSeleccionadas.includes(i.tag)) return false
    if (marcasSeleccionadas.length > 0 && (!i.marca || !marcasSeleccionadas.includes(i.marca))) return false
    if (i.precio > precioMaxActivo) return false
    return true
  })

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

  const subtotalItems = lineas.reduce((acc, linea) => acc + linea.cantidad * linea.item.precio, 0)
  const subtotalDocumentos = documentos.reduce((acc, doc) => acc + doc.precio, 0)
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
    setCarritoAbierto(false)
    setRevisando(true)
  }

  function seguirEditando() {
    setRevisando(false)
    setCarritoAbierto(true)
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
        descripcion: detalle.trim() || null,
        items: requestItems,
      })
      for (const doc of documentos) {
        await documentosApi.solicitarImpresion({
          documentoOrigenId: doc.documentoOrigenId,
          pedidoId: pedido.id,
          cantidadCopias: doc.cantidadCopias,
          esDobleFaz: doc.esDobleFaz,
          aColor: doc.modoColor !== 'BN',
          modoColor: doc.modoColor,
          tamanio: doc.tamanio,
          tipoPapel: doc.tipoPapel,
          paginasPorCara: doc.paginasPorCara,
          orientacion: doc.orientacion,
          terminacion: doc.terminacion,
        })
      }
      navigate('/mis-pedidos', { state: { creado: pedido.id } })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear el pedido')
    } finally {
      setCreando(false)
    }
  }

  function renderFiltros() {
    return (
      <>
        {categoriasDisponibles.length > 0 && (
          <>
            <div className={styles.filtrosTitulo}>Categoría</div>
            <div className={styles.filtrosLista}>
              {categoriasDisponibles.map((cat) => (
                <label key={cat} className={styles.filtroCheckbox}>
                  <input
                    type="checkbox"
                    checked={categoriasSeleccionadas.includes(cat)}
                    onChange={() => toggleCategoria(cat)}
                  />
                  <span>{capitalizar(cat)}</span>
                </label>
              ))}
            </div>
          </>
        )}

        {marcasDisponibles.length > 0 && (
          <>
            <div className={styles.filtrosTitulo}>Marca</div>
            <div className={styles.filtrosLista}>
              {marcasDisponibles.map((marca) => (
                <label key={marca} className={styles.filtroCheckbox}>
                  <input
                    type="checkbox"
                    checked={marcasSeleccionadas.includes(marca)}
                    onChange={() => toggleMarca(marca)}
                  />
                  <span>{capitalizar(marca)}</span>
                </label>
              ))}
            </div>
          </>
        )}

        {precioTope > 0 && (
          <>
            <div className={styles.filtrosTitulo}>Precio</div>
            <input
              type="range"
              className={styles.precioSlider}
              min={0}
              max={precioTope}
              value={precioMaxActivo}
              onChange={(e) => setPrecioMax(Number(e.target.value))}
            />
            <div className={styles.precioLabels}>
              <span>$0</span>
              <span>${precioMaxActivo.toFixed(0)}</span>
            </div>
          </>
        )}

        <button type="button" className={styles.limpiarFiltrosBtn} onClick={limpiarFiltros}>
          Limpiar filtros
        </button>
      </>
    )
  }

  function renderCarrito() {
    return (
      <>
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
                    {doc.cantidadCopias} copia{doc.cantidadCopias === 1 ? '' : 's'}
                  </div>
                </div>
                <div className={styles.summaryLineActions}>
                  <span className={styles.summarySubtotal}>${doc.precio.toFixed(2)}</span>
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
          <p className="empty-state" style={{ padding: '4px 0 0' }}>
            Envíos solo dentro de la ciudad de Paysandú
          </p>
          {esEnvio && (
            <input
              className={styles.envioInput}
              placeholder="Dirección de envío"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
            />
          )}
        </div>

        <div className={styles.envioBlock}>
          <div className={styles.envioTitle}>Detalle del pedido (opcional)</div>
          <textarea
            className={styles.detalleInput}
            placeholder="Ej: paso a buscarlo el sábado a la tarde"
            value={detalle}
            onChange={(e) => setDetalle(e.target.value)}
            rows={2}
            maxLength={300}
          />
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
      </>
    )
  }

  return (
    <div className={styles.pageWrap}>
      <PageHeader title="Catálogo" subtitle="Armá tu pedido con productos, servicios y ofertas de la papelería" />
      {error && !revisando && <p className="error">{error}</p>}

      <div className={styles.searchBar}>
        <span>🔍</span>
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar productos, marcas o servicios…"
        />
      </div>

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
          <aside className={styles.filtrosSidebar}>{renderFiltros()}</aside>

          <div className={styles.gridCol}>
            <div className={styles.chipsRow}>
              <button type="button" className={styles.filtrosBtn} onClick={() => setFiltrosAbiertos(true)}>
                ⚙️ Filtros
              </button>
              {categoriasSeleccionadas.map((cat) => (
                <span key={cat} className={styles.chip} onClick={() => toggleCategoria(cat)}>
                  {capitalizar(cat)} <span>✕</span>
                </span>
              ))}
              {marcasSeleccionadas.map((marca) => (
                <span key={marca} className={styles.chip} onClick={() => toggleMarca(marca)}>
                  {capitalizar(marca)} <span>✕</span>
                </span>
              ))}
              <span className={styles.resultCount}>{visibles.length} resultados</span>
            </div>

            {visibles.length === 0 ? (
              <p className="empty-state">No hay resultados con estos filtros.</p>
            ) : (
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
            )}
          </div>

          <aside className={styles.summary}>{renderCarrito()}</aside>
        </div>
      )}

      {hayItems && (
        <div className={styles.bottomBar}>
          <div>
            <div className={styles.bottomBarCount}>
              {lineas.length + documentos.length} item{lineas.length + documentos.length === 1 ? '' : 's'}
            </div>
            <div className={styles.bottomBarTotal}>${total.toFixed(2)}</div>
          </div>
          <button type="button" onClick={() => setCarritoAbierto(true)}>
            Ver pedido
          </button>
        </div>
      )}

      {filtrosAbiertos && (
        <Modal title="Filtros" onClose={() => setFiltrosAbiertos(false)}>
          <div className={styles.pickerForm}>{renderFiltros()}</div>
        </Modal>
      )}

      {carritoAbierto && (
        <Modal title="Tu pedido" onClose={() => setCarritoAbierto(false)}>
          <div className={styles.pickerForm}>{renderCarrito()}</div>
        </Modal>
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
                <span className={styles.summarySubtotal}>${doc.precio.toFixed(2)}</span>
              </div>
            ))}
            <div className={styles.summaryLine}>
              <span className={styles.summaryLineName}>
                {esEnvio ? `Envío a: ${direccion}` : 'Retiro en el local'}
              </span>
              {esEnvio && <span className={styles.summarySubtotal}>${costoEnvio.toFixed(2)}</span>}
            </div>
            {detalle.trim() && (
              <div className={styles.summaryLine}>
                <span className={styles.summaryLineName}>Detalle: {detalle.trim()}</span>
              </div>
            )}
          </div>

          <div className={styles.summaryTotal}>
            <span>Total</span>
            <span className={styles.summaryTotalValue}>${total.toFixed(2)}</span>
          </div>

          {error && <p className="error">{error}</p>}

          <div className={styles.reviewActions}>
            <button type="button" className="secondary" onClick={seguirEditando} disabled={creando}>
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
