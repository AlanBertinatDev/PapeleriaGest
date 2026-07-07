import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { PageHeader } from '../components/PageHeader'
import { AuthImage } from '../components/AuthImage'
import { CategoryTag } from '../components/CategoryTag'
import { ofertasApi, type OfertaResponse } from '../api/ofertas'
import { categoryBorderColor, categoryTintColor } from '../lib/categoryColor'
import styles from './HomePage.module.css'

function tagLabel(oferta: OfertaResponse): string {
  if (oferta.tipo === 'SERVICIO') return 'Servicio'
  const categoria = oferta.productos[0]?.categoria.nombre ?? 'Producto'
  return oferta.tipo === 'PACK' ? `Pack · ${categoria}` : categoria
}

export function HomePage() {
  const { usuario, isAdmin, isDocente } = useAuth()
  const [ofertas, setOfertas] = useState<OfertaResponse[]>([])

  useEffect(() => {
    if (isAdmin) return
    ofertasApi
      .listarVigentes()
      .then((data) => setOfertas(data.slice(0, 3)))
      .catch(() => {})
  }, [isAdmin])

  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return (
    <div>
      <PageHeader title={`Hola, ${usuario?.nombre}`} subtitle="¿Qué querés hacer hoy?" />

      {ofertas.length > 0 && (
        <div className={styles.section}>
          <div className={styles.ofertasHeader}>
            <h2>Ofertas destacadas</h2>
            <Link to="/ofertas" className={styles.verTodas}>
              Ver todas las ofertas →
            </Link>
          </div>
          <div className="tile-grid">
            {ofertas.map((oferta) => {
              const tag = tagLabel(oferta)
              return (
                <div className="tile-card" key={oferta.id} style={{ borderTopColor: categoryBorderColor(tag) }}>
                  <div className="tile-image-wrap" style={{ background: categoryTintColor(tag) }}>
                    {oferta.tieneImagen ? (
                      <AuthImage src={`/ofertas/${oferta.id}/imagen`} alt={oferta.titulo} />
                    ) : oferta.productos[0]?.tieneImagen ? (
                      <AuthImage
                        src={`/productos/${oferta.productos[0].codigoProducto}/imagen`}
                        alt={oferta.titulo}
                      />
                    ) : (
                      <div className="image-placeholder" aria-label="Sin foto" />
                    )}
                  </div>
                  <div className="tile-body">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div className="tile-title">{oferta.titulo}</div>
                      <CategoryTag label={tag} />
                    </div>
                    <div className="tile-price">${oferta.precio}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <ul className="link-list">
        <li>
          <Link to="/catalogo">Ver catálogo y hacer un pedido</Link>
        </li>
        <li>
          <Link to="/mis-pedidos">Ver mis pedidos</Link>
        </li>
        <li>
          <Link to="/ofertas">Ver ofertas vigentes</Link>
        </li>
        <li>
          <Link to="/buscar-materiales">Buscar material de un curso</Link>
        </li>
        <li>
          <Link to="/mis-documentos">Ver mis documentos</Link>
        </li>
        {isDocente && (
          <li>
            <Link to="/docente/materiales">Cargar material para un curso</Link>
          </li>
        )}
      </ul>
    </div>
  )
}
