import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { fotosHomeApi, type FotoHomeResponse } from '../api/fotosHome'
import { AuthImage } from '../components/AuthImage'
import styles from './LandingPage.module.css'

const AUTOPLAY_MS = 5000
const WHATSAPP_URL = 'https://wa.me/59898254185'
const MAPS_EMBED_URL = 'https://www.google.com/maps?q=-32.3161154,-58.0929586&z=17&output=embed'

const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function IconMapPin() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function IconClock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}

function IconMessageCircle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}

function IconInstagram() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37a4 4 0 1 1-7.914 1.174A4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function IconArrowRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}

function IconChevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={direction === 'left' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
    </svg>
  )
}

function IconLibro() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}

function IconImpresora() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9V2h12v7" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  )
}

function IconCarrito() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.5 3h2l2.8 12.4a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21.5 7H6" />
    </svg>
  )
}

const SERVICIOS = [
  {
    Icono: IconLibro,
    chipClase: styles.chipRosa,
    titulo: 'Papelería y librería',
    descripcion: 'Útiles escolares, de oficina y de regalo, con stock renovado todo el año.',
    accion: 'Ingresá para ver el catálogo',
    link: '/login',
  },
  {
    Icono: IconImpresora,
    chipClase: styles.chipDurazno,
    titulo: 'Imprenta',
    descripcion: 'Impresiones en blanco y negro o color, simples o a doble faz, listas para retirar.',
    accion: 'Enviar archivo',
    link: '/login',
  },
  {
    Icono: IconCarrito,
    chipClase: styles.chipLila,
    titulo: 'Pedidos online',
    descripcion: 'Creá tu cuenta para armar pedidos, hacer seguimiento y recibir tus ofertas favoritas.',
    accion: 'Crear cuenta',
    link: '/registrarse',
  },
]

const FONDOS_CARRUSEL = [styles.fondoRosa, styles.fondoDurazno, styles.fondoLila]

function HeroCarousel({ fotos }: { fotos: FotoHomeResponse[] }) {
  const [index, setIndex] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function reiniciarAutoplay() {
    if (timerRef.current) clearInterval(timerRef.current)
    if (fotos.length < 2 || prefersReducedMotion) return
    timerRef.current = setInterval(() => setIndex((i) => (i + 1) % fotos.length), AUTOPLAY_MS)
  }

  useEffect(() => {
    reiniciarAutoplay()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fotos.length])

  function goTo(i: number) {
    setIndex(i)
    reiniciarAutoplay()
  }

  return (
    <div className={styles.heroCarousel}>
      <div className={styles.heroFrame}>
        <div className={`${styles.heroBackdrop} ${FONDOS_CARRUSEL[index % FONDOS_CARRUSEL.length]}`} />
        <div className={styles.heroPhoto}>
          {fotos.length === 0 ? (
            <span>Foto del local, próximamente</span>
          ) : (
            fotos.map((foto, i) => (
              <div key={foto.id} className={styles.heroSlide} style={{ opacity: i === index ? 1 : 0 }}>
                <AuthImage src={`/fotos-home/${foto.id}/imagen`} alt="crea+ · Bertinat Papelería" />
              </div>
            ))
          )}
        </div>
        <div className={styles.heroBadge}>
          <span className={styles.heroBadgeNumero}>34</span>
          <span>
            años en
            <br />
            Paysandú
          </span>
        </div>
      </div>

      {fotos.length > 1 && (
        <div className={styles.heroControles}>
          <div className={styles.heroDots}>
            {fotos.map((foto, i) => (
              <button
                key={foto.id}
                type="button"
                aria-label={`Ver foto ${i + 1}`}
                className={i === index ? `${styles.heroDot} ${styles.heroDotActive}` : styles.heroDot}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Foto anterior"
            className={styles.heroArrow}
            onClick={() => goTo((index - 1 + fotos.length) % fotos.length)}
          >
            <IconChevron direction="left" />
          </button>
          <button
            type="button"
            aria-label="Foto siguiente"
            className={styles.heroArrow}
            onClick={() => goTo((index + 1) % fotos.length)}
          >
            <IconChevron direction="right" />
          </button>
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
        <div className={styles.heroTexto}>
          <span className={styles.pill}>
            <span className={styles.pillPunto} />
            Papelería en Paysandú desde hace más de 34 años
          </span>
          <h1 className={styles.h1}>
            Todo para crear <span className={styles.h1Accent}>y más.</span>
          </h1>
          <p className={styles.subtitulo}>
            Útiles escolares, de oficina y de regalo, e impresiones listas para retirar. Hacé tu pedido online y
            pasá a buscarlo.
          </p>
          <div className={styles.heroCtas}>
            <Link to="/registrarse" className={styles.ctaPrimario}>
              Crear cuenta gratis <IconArrowRight />
            </Link>
            <Link to="/login" className={styles.ctaSecundario}>
              Enviar a imprimir
            </Link>
          </div>
          <div className={styles.heroMeta}>
            <span>
              <IconMapPin /> 18 de Julio 684, frente al Liceo N°1
            </span>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
              <IconMessageCircle /> Escribinos por WhatsApp
            </a>
          </div>
        </div>

        <HeroCarousel fotos={fotos} />
      </section>

      <section className={styles.section} id="servicios">
        <h2 className={styles.h2}>¿Qué necesitás hoy?</h2>
        <div className={styles.serviciosGrid}>
          {SERVICIOS.map((servicio) => (
            <Link
              to={servicio.link}
              className={`${styles.servicioCard} ${servicio.chipClase}`}
              key={servicio.titulo}
            >
              <span className={styles.servicioIcono}>
                <servicio.Icono />
              </span>
              <h3 className={styles.servicioTitulo}>{servicio.titulo}</h3>
              <p className={styles.servicioDescripcion}>{servicio.descripcion}</p>
              <span className={styles.servicioAccion}>
                {servicio.accion} <IconArrowRight />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section} id="visitanos">
        <div className={styles.visitanos}>
          <div className={styles.visitanosInfo}>
            <h2 className={styles.h2}>Visitanos</h2>
            <div className={styles.visitanosDato}>
              <IconMapPin />
              <div>
                <strong>18 de Julio 684</strong>
                <br />
                Frente al Liceo N°1, Paysandú
              </div>
            </div>
            <div className={styles.visitanosDato}>
              <IconClock />
              <div>
                <strong>Horarios</strong>
                <br />
                Lunes a viernes: 7 a 13 y 15 a 20
                <br />
                Sábados: 9 a 13
              </div>
            </div>
            <div className={styles.visitanosBotones}>
              <a className={styles.botonWhatsapp} href={WHATSAPP_URL} target="_blank" rel="noreferrer">
                <IconMessageCircle /> 098 254 185
              </a>
              <a
                className={styles.botonOutline}
                href="https://wa.me/59898846144"
                target="_blank"
                rel="noreferrer"
              >
                <IconMessageCircle /> 098 846 144
              </a>
              <a
                className={styles.botonOutline}
                href="https://instagram.com/bertinatpapeleria"
                target="_blank"
                rel="noreferrer"
              >
                <IconInstagram /> @bertinatpapeleria
              </a>
            </div>
          </div>
          <iframe
            className={styles.visitanosMapa}
            src={MAPS_EMBED_URL}
            title="Ubicación de Bertinat Papelería"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </div>
  )
}
