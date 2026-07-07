import { useEffect, useState } from 'react'
import { ofertasApi, type OfertaResponse } from '../api/ofertas'
import { ApiError } from '../api/client'
import { AuthImage } from '../components/AuthImage'

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
      <div className="page-hero">
        <h1>Ofertas vigentes</h1>
        <p>Promociones activas de la papelería</p>
      </div>
      {error && <p className="error">{error}</p>}
      {ofertas.length === 0 && <p className="empty-state">No hay ofertas vigentes en este momento.</p>}

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
        ))}
      </div>
    </div>
  )
}
