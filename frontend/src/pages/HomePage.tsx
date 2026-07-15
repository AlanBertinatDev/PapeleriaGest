import { useEffect, useState, type CSSProperties } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { PageHeader } from '../components/PageHeader'
import { pedidosApi } from '../api/pedidos'
import { ofertasApi } from '../api/ofertas'
import { documentosApi } from '../api/documentos'
import styles from './HomePage.module.css'

const HUE_DURAZNO = 70
const HUE_ROSA = 20
const HUE_CELESTE = 230

function hueStyle(hue: number): CSSProperties {
  return { '--h': hue } as CSSProperties
}

function Pill({ count, label, hue }: { count: number; label: string; hue: number }) {
  if (count <= 0) return null
  return (
    <span className={styles.cardPill} style={hueStyle(hue)}>
      {count} {label}
    </span>
  )
}

export function HomePage() {
  const { usuario, isAdmin } = useAuth()
  const [pedidosEnCurso, setPedidosEnCurso] = useState(0)
  const [ofertasVigentes, setOfertasVigentes] = useState(0)
  const [documentosListos, setDocumentosListos] = useState(0)

  useEffect(() => {
    if (isAdmin) return
    pedidosApi
      .misPedidos()
      .then((pedidos) =>
        setPedidosEnCurso(
          pedidos.filter((p) => p.estado === 'PENDIENTE' || p.estado === 'EN_REVISION' || p.estado === 'LISTO')
            .length,
        ),
      )
      .catch(() => {})
    ofertasApi
      .listarVigentes()
      .then((ofertas) => setOfertasVigentes(ofertas.length))
      .catch(() => {})
    documentosApi
      .misDocumentos()
      .then((documentos) => setDocumentosListos(documentos.filter((d) => d.estado === 'IMPRESO').length))
      .catch(() => {})
  }, [isAdmin])

  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return (
    <div>
      <PageHeader title={`Hola, ${usuario?.nombre}`} subtitle="¿Qué querés hacer hoy?" />

      <Link to="/catalogo" className={styles.primaryCard}>
        <div className={styles.primaryIcon}>🛒</div>
        <div className={styles.primaryBody}>
          <div className={styles.primaryTitle}>Ver catálogo y hacer un pedido</div>
          <div className={styles.primaryDesc}>
            Productos, ofertas, servicios y documentos para imprimir — todo en un mismo pedido.
          </div>
        </div>
        <div className={styles.primaryCta}>Ir al catálogo →</div>
      </Link>

      <div className={styles.grid}>
        <Link to="/mis-pedidos" className={styles.card}>
          <div className={styles.cardTop}>
            <div className={styles.cardIcon} style={hueStyle(HUE_DURAZNO)}>
              📦
            </div>
            <Pill count={pedidosEnCurso} label="en curso" hue={HUE_DURAZNO} />
          </div>
          <div>
            <div className={styles.cardTitle}>Mis pedidos</div>
            <div className={styles.cardDesc}>Seguí el estado de tus compras y retiros</div>
          </div>
        </Link>

        <Link to="/ofertas" className={styles.card}>
          <div className={styles.cardTop}>
            <div className={styles.cardIcon} style={hueStyle(HUE_ROSA)}>
              🏷️
            </div>
            <Pill count={ofertasVigentes} label="activas" hue={HUE_ROSA} />
          </div>
          <div>
            <div className={styles.cardTitle}>Ofertas vigentes</div>
            <div className={styles.cardDesc}>Descuentos y combos disponibles esta semana</div>
          </div>
        </Link>

        <Link to="/mis-documentos" className={styles.card}>
          <div className={styles.cardTop}>
            <div className={styles.cardIcon} style={hueStyle(HUE_CELESTE)}>
              🖨️
            </div>
            <Pill count={documentosListos} label="listo" hue={HUE_CELESTE} />
          </div>
          <div>
            <div className={styles.cardTitle}>Mis documentos</div>
            <div className={styles.cardDesc}>Archivos subidos para imprimir y su estado</div>
          </div>
        </Link>

      </div>
    </div>
  )
}
