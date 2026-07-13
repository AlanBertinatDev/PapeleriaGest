import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { NotificationCenter } from './NotificationCenter'
import { AuthModal, type AuthTab } from './AuthModal'
import { MiCuentaModal } from './MiCuentaModal'
import { Footer } from './Footer'
import logo from '../assets/logo.jpeg'
import styles from './Layout.module.css'
import { iniciales } from '../lib/iniciales'

function SidebarLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <NavLink to={to} className={({ isActive }) => (isActive ? styles.active : undefined)} end={to === '/'}>
      {children}
    </NavLink>
  )
}

export function Layout({ children }: { children: ReactNode }) {
  const { usuario, isAdmin, isDocente, logout, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [authTab, setAuthTab] = useState<AuthTab | null>(null)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [cuentaAbierta, setCuentaAbierta] = useState(false)

  useEffect(() => {
    if (location.pathname === '/login') setAuthTab('login')
    else if (location.pathname === '/registrarse') setAuthTab('register')
  }, [location.pathname])

  useEffect(() => {
    if (!menuAbierto) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuAbierto(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [menuAbierto])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function closeAuthModal() {
    setAuthTab(null)
    if (location.pathname === '/login' || location.pathname === '/registrarse') {
      navigate('/')
    }
  }

  if (loading) {
    return null
  }

  if (!usuario) {
    return (
      <div className="app-shell" style={{ flexDirection: 'column' }}>
        <header className="guest-header">
          <Link to="/" className="sidebar-brand">
            <img src={logo} alt="Bertinat Papelería" />
            <span>
              Bertinat
              <small>Papelería</small>
            </span>
          </Link>
          <div className="guest-header-actions">
            <button className="guest-header-login" onClick={() => setAuthTab('login')}>
              Ingresar
            </button>
            <button className="guest-header-register" onClick={() => setAuthTab('register')}>
              Registrarme
            </button>
          </div>
        </header>
        <div className="guest-content">{children}</div>
        <Footer />
        {authTab && (
          <AuthModal
            initialTab={authTab}
            onClose={closeAuthModal}
            onSuccess={() => {
              setAuthTab(null)
              navigate('/')
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div className="app-shell">
      <div className={styles.topbar}>
        <button
          type="button"
          className={styles.hamburger}
          aria-label="Abrir menú"
          onClick={() => setMenuAbierto(true)}
        >
          <span />
          <span />
          <span />
        </button>
        <Link to={isAdmin ? '/admin/dashboard' : '/'} className={styles.topbarBrand}>
          <img src={logo} alt="Bertinat Papelería" className={styles.brandLogo} />
          <span className={styles.brandText}>Bertinat</span>
        </Link>
        <div className={styles.topbarAvatar}>{iniciales(usuario.nombre)}</div>
      </div>

      {menuAbierto && <div className={styles.overlay} onClick={() => setMenuAbierto(false)} />}

      <aside className={menuAbierto ? `${styles.sidebar} ${styles.sidebarOpen}` : styles.sidebar}>
        <Link to={isAdmin ? '/admin/dashboard' : '/'} className={styles.brand}>
          <img src={logo} alt="Bertinat Papelería" className={styles.brandLogo} />
          <span className={styles.brandText}>
            Bertinat
            <span className={styles.brandSub}>Papelería</span>
          </span>
        </Link>

        <nav className={styles.nav} onClick={() => setMenuAbierto(false)}>
          {isAdmin ? (
            <div>
              <div className={styles.sectionTitle}>Administración</div>
              <div className={styles.links}>
                <SidebarLink to="/admin/dashboard">Inicio</SidebarLink>
                <SidebarLink to="/admin/productos">Productos</SidebarLink>
                <SidebarLink to="/admin/pedidos">Pedidos</SidebarLink>
                <SidebarLink to="/admin/ofertas">Ofertas</SidebarLink>
                <SidebarLink to="/admin/fotos-home">Fotos del home</SidebarLink>
                <SidebarLink to="/admin/documentos">Documentos</SidebarLink>
                <SidebarLink to="/admin/cursos">Cursos</SidebarLink>
                <SidebarLink to="/admin/usuarios">Usuarios</SidebarLink>
                <SidebarLink to="/admin/reportes">Reportes</SidebarLink>
                <SidebarLink to="/admin/configuracion">Configuración</SidebarLink>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.links}>
                <SidebarLink to="/">Inicio</SidebarLink>
              </div>

              <div>
                <div className={styles.sectionTitle}>Comprar</div>
                <div className={styles.links}>
                  <SidebarLink to="/catalogo">Catálogo</SidebarLink>
                  <SidebarLink to="/mis-pedidos">Mis pedidos</SidebarLink>
                  <SidebarLink to="/ofertas">Ofertas</SidebarLink>
                </div>
              </div>

              <div>
                <div className={styles.sectionTitle}>Imprimir</div>
                <div className={styles.links}>
                  <SidebarLink to="/buscar-materiales">Buscar materiales</SidebarLink>
                  <SidebarLink to="/mis-documentos">Mis documentos</SidebarLink>
                </div>
              </div>

              {isDocente && (
                <div>
                  <div className={styles.sectionTitle}>Docencia</div>
                  <div className={styles.links}>
                    <SidebarLink to="/docente/materiales">Cargar material</SidebarLink>
                  </div>
                </div>
              )}
            </>
          )}
        </nav>

        <div className={styles.userFooter}>
          <button
            type="button"
            className={styles.userRow}
            onClick={() => {
              setMenuAbierto(false)
              setCuentaAbierta(true)
            }}
          >
            <div className={styles.avatar}>{iniciales(usuario.nombre)}</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{usuario.nombre}</span>
              <span className={styles.userRole}>{usuario.nivel}</span>
            </div>
          </button>
          <button className={styles.logoutButton} onClick={handleLogout}>
            Salir
          </button>
        </div>
      </aside>
      <main className="app-content">
        {isAdmin && (
          <div className="admin-topbar">
            <NotificationCenter />
          </div>
        )}
        {children}
      </main>
      {cuentaAbierta && <MiCuentaModal onClose={() => setCuentaAbierta(false)} />}
    </div>
  )
}
