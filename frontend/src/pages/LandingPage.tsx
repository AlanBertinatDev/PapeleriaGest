import { useEffect, useState } from 'react'
import { fotosHomeApi, type FotoHomeResponse } from '../api/fotosHome'
import { AuthImage } from '../components/AuthImage'
import styles from './LandingPage.module.css'

const ROTACION_MS = 4000

const SERVICIOS = [
  {
    icono: '📚',
    titulo: 'Papelería y librería',
    descripcion: 'Útiles escolares, de oficina y de regalo, con stock renovado todo el año.',
  },
  {
    icono: '🖨️',
    titulo: 'Imprenta',
    descripcion: 'Subí tus documentos o buscá el material de tu curso y retiralo ya impreso.',
  },
  {
    icono: '🛒',
    titulo: 'Pedidos online',
    descripcion: 'Creá tu cuenta para armar pedidos, hacer seguimiento y recibir tus ofertas favoritas.',
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

  const foto = fotos[index % fotos.length]
  return (
    <div className={styles.heroImage}>
      <AuthImage key={foto.id} src={`/fotos-home/${foto.id}/imagen`} alt="Bertinat Papelería" />
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
        <div className={styles.heroText}>
          <p className={styles.heroSubtitle}>Mirá las ofertas de la semana antes de pasar por el local.</p>
        </div>
        <HeroImage fotos={fotos} />
      </section>

      <section className={styles.section}>
        <div className={styles.serviciosGrid}>
          {SERVICIOS.map((servicio) => (
            <div className={styles.servicioCard} key={servicio.titulo}>
              <span className={styles.servicioIcono}>{servicio.icono}</span>
              <div className={styles.servicioTitulo}>{servicio.titulo}</div>
              <p className={styles.servicioDescripcion}>{servicio.descripcion}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
