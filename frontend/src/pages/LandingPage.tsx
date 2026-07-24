import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fotosHomeApi, type FotoHomeResponse } from '../api/fotosHome'
import { AuthImage } from '../components/AuthImage'
import styles from './LandingPage.module.css'

const ROTACION_MS = 4000

function IconLibro({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}

function IconImpresora({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9V2h12v7" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  )
}

function IconCarrito({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.5 3h2l2.8 12.4a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21.5 7H6" />
    </svg>
  )
}

const SERVICIOS = [
  {
    Icono: IconLibro,
    color: 'oklch(0.5 0.13 20)',
    chipClase: styles.chipRosa,
    titulo: 'Papelería y librería',
    descripcion: 'Útiles escolares, de oficina y de regalo, con stock renovado todo el año.',
  },
  {
    Icono: IconImpresora,
    color: 'oklch(0.45 0.13 230)',
    chipClase: styles.chipCeleste,
    titulo: 'Imprenta',
    descripcion: 'Subí tus documentos o buscá el material de tu curso y retiralo ya impreso.',
  },
  {
    Icono: IconCarrito,
    color: '#fff',
    chipClase: styles.chipOscuro,
    titulo: 'Pedidos online',
    descripcion: 'Creá tu cuenta para armar pedidos, hacer seguimiento y recibir tus ofertas favoritas.',
    destacada: true,
    link: '/registrarse',
  },
]

function HeroImage({ fotos }: { fotos: FotoHomeResponse[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (fotos.length < 2) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % fotos.length), ROTACION_MS)
    return () => clearInterval(timer)
  }, [fotos.length])

  if (fotos.length === 0) {
    return (
      <div className={styles.heroImage}>
        <span>foto destacada de librería</span>
      </div>
    )
  }

  return (
    <div className={styles.heroImage}>
      <div
        className={styles.heroTrack}
        style={{
          width: `${fotos.length * 100}%`,
          transform: `translateX(-${index * (100 / fotos.length)}%)`,
        }}
      >
        {fotos.map((foto) => (
          <div className={styles.heroSlide} key={foto.id} style={{ flexBasis: `${100 / fotos.length}%` }}>
            <AuthImage src={`/fotos-home/${foto.id}/imagen`} alt="crea+ · Bertinat Papelería" />
          </div>
        ))}
      </div>

      {fotos.length > 1 && (
        <div className={styles.heroDots}>
          {fotos.map((foto, i) => (
            <button
              key={foto.id}
              type="button"
              aria-label={`Ver foto ${i + 1}`}
              className={i === index ? `${styles.heroDot} ${styles.heroDotActive}` : styles.heroDot}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function LandingPage() {
  const [fotos, setFotos] = useState<FotoHomeResponse[]>([])

  useEffect(() => {
    fotosHomeApi
      .listar()
      .then(setFotos)
      .catch(() => {})
  }, [])

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <HeroImage fotos={fotos} />
      </section>

      <section className={styles.section}>
        <div className={styles.serviciosGrid}>
          {SERVICIOS.map((servicio) => {
            const cardClase = servicio.destacada
              ? `${styles.servicioCard} ${styles.servicioDestacada}`
              : styles.servicioCard
            const contenido = (
              <>
                <span className={`${styles.servicioIcono} ${servicio.chipClase}`}>
                  <servicio.Icono color={servicio.color} />
                </span>
                <div className={styles.servicioTitulo}>{servicio.titulo}</div>
                <p className={styles.servicioDescripcion}>{servicio.descripcion}</p>
              </>
            )
            return servicio.link ? (
              <Link to={servicio.link} className={cardClase} key={servicio.titulo}>
                {contenido}
              </Link>
            ) : (
              <div className={cardClase} key={servicio.titulo}>
                {contenido}
              </div>
            )
          })}
        </div>
      </section>

      <section className={styles.section} id="nosotros">
        <div className={styles.nosotros}>
          <h2 className={styles.nosotrosTitle}>Más de 34 años en Paysandú</h2>
          <p className={styles.nosotrosText}>
            Bertinat Papelería lleva más de tres décadas siendo parte de la vida cotidiana de Paysandú: la
            primera mochila, la primera agenda, la fotocopia urgente, el regalo de cumpleaños. Hoy seguimos
            siendo esa papelería de siempre, pero con todo lo que sigue: más ideas, más herramientas, más
            formas de crear. Somos crea+.
          </p>
          <p className={styles.nosotrosQuote}>Todo para crear y más.</p>
        </div>
      </section>
    </div>
  )
}
