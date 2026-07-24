import styles from './Footer.module.css'

function IconPhone() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function IconInstagram() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37a4 4 0 1 1-7.914 1.174A4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function IconPin() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

const MAPS_URL =
  'https://www.google.com/maps/place/Bertinat+Papeleria/@-32.3161616,-58.0953628,17.14z/data=!4m6!3m5!1s0x95afcb5947b942cf:0x23fd78bda71c7d21!8m2!3d-32.3161154!4d-58.0929586!16s%2Fg%2F11llm3vwcp?entry=ttu&g_ep=EgoyMDI2MDcyMS4wIKXMDSoASAFQAw%3D%3D'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.copyright}>© {new Date().getFullYear()} crea+ · Bertinat Papelería. Todos los derechos reservados.</div>

      <div className={styles.info}>
        <a className={styles.infoItem} href="/#nosotros">
          Nosotros
        </a>
        <a className={styles.infoItem} href="https://wa.me/59898254185" target="_blank" rel="noreferrer">
          <IconPhone /> 098 254 185
        </a>
        <a className={styles.infoItem} href="https://wa.me/59898846144" target="_blank" rel="noreferrer">
          <IconPhone /> 098 846 144
        </a>
        <a className={styles.infoItem} href="https://instagram.com/bertinatpapeleria" target="_blank" rel="noreferrer">
          <IconInstagram /> @bertinatpapeleria
        </a>
        <a className={styles.infoItem} href={MAPS_URL} target="_blank" rel="noreferrer">
          <IconPin /> 18 de Julio 684, frente al Liceo N°1
        </a>
      </div>
    </footer>
  )
}
