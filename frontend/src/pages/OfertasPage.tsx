import { useEffect, useState } from 'react'
import { ofertasApi, type OfertaResponse } from '../api/ofertas'
import { ApiError } from '../api/client'
import { AuthImage } from '../components/AuthImage'
import { PageHeader } from '../components/PageHeader'
import { CategoryTag } from '../components/CategoryTag'
import { categoryBorderColor, categoryTintColor } from '../lib/categoryColor'

function tagLabel(oferta: OfertaResponse): string {
  if (oferta.tipo === 'SERVICIO') return 'Servicio'
  const categoria = oferta.productos[0]?.categoria.nombre ?? 'Producto'
  return oferta.tipo === 'PACK' ? `Pack · ${categoria}` : categoria
}

export function OfertasPage() {
  const [ofertas, setOfertas] = useState<OfertaResponse[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ofertasApi
      .listarVigentes()
      .then(setOfertas)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'No se pudieron cargar las ofertas'))
  }, [])

  return (
    <div>
      <PageHeader title="Ofertas vigentes" subtitle="Promociones activas de la papelería" />
      {error && <p className="error">{error}</p>}
      {ofertas.length === 0 && <p className="empty-state">No hay ofertas vigentes en este momento.</p>}

      <div className="tile-grid">
        {ofertas.map((oferta) => {
          const tag = tagLabel(oferta)
          return (
            <div className="tile-card" key={oferta.id} style={{ borderTopColor: categoryBorderColor(tag) }}>
              <div className="tile-image-wrap" style={{ background: categoryTintColor(tag) }}>
                {oferta.tieneImagen ? (
                  <AuthImage src={`/ofertas/${oferta.id}/imagen`} alt={oferta.titulo} />
                ) : oferta.productos[0]?.tieneImagen ? (
                  <AuthImage src={`/productos/${oferta.productos[0].codigoProducto}/imagen`} alt={oferta.titulo} />
                ) : (
                  <div className="image-placeholder" aria-label="Sin foto" />
                )}
              </div>
              <div className="tile-body">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div className="tile-title">{oferta.titulo}</div>
                  <CategoryTag label={tag} />
                </div>
                {oferta.descripcion && <div className="tile-meta">{oferta.descripcion}</div>}
                <div className="tile-meta">
                  Válida del {oferta.fechaDesde} al {oferta.fechaHasta}
                </div>
                <div className="tile-price">${oferta.precio}</div>
                <div className="tile-product-chip-list">
                  {oferta.productos.map((p) => (
                    <span className="tile-product-chip" key={p.codigoProducto}>
                      {p.nombre}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
