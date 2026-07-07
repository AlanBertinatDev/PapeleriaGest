import type { ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { NotificationCenter } from './NotificationCenter'
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

  function handleLogout() {
    logout()
    navigate('/login')
  }

  if (loading) {
    return null
  }

  if (!usuario) {
    return (
      <div className="app-shell" style={{ flexDirection: 'column' }}>
        <header className="guest-header">
          <Link to="/login" className="sidebar-brand">
            <img src={logo} alt="Bertinat Papelería" />
            <span>Bertinat Papelería</span>
          </Link>
        </header>
        <div className="guest-content">{children}</div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <aside className={styles.sidebar}>
        <Link to={isAdmin ? '/admin/dashboard' : '/'} className={styles.brand}>
          <img src={logo} alt="Bertinat Papelería" className={styles.brandLogo} />
          <span className={styles.brandText}>
            Bertinat
            <span className={styles.brandSub}>Papelería</span>
          </span>
        </Link>

        <nav className={styles.nav}>
          {isAdmin ? (
            <div>
              <div className={styles.sectionTitle}>Administración</div>
              <div className={styles.links}>
                <SidebarLink to="/admin/dashboard">Inicio</SidebarLink>
                <SidebarLink to="/admin/productos">Productos</SidebarLink>
                <SidebarLink to="/admin/pedidos">Pedidos</SidebarLink>
                <SidebarLink to="/admin/ofertas">Ofertas</SidebarLink>
                <SidebarLink to="/admin/documentos">Documentos</SidebarLink>
                <SidebarLink to="/admin/cursos">Cursos</SidebarLink>
                <SidebarLink to="/admin/usuarios">Usuarios</SidebarLink>
                <SidebarLink to="/admin/reportes">Reportes</SidebarLink>
                <SidebarLink to="/admin/configuracion">Configuración</SidebarLink>
              </div>
            </div>
          ) : (
            <>
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
          <div className={styles.userRow}>
            <div className={styles.avatar}>{iniciales(usuario.nombre)}</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{usuario.nombre}</span>
              <span className={styles.userRole}>{usuario.nivel}</span>
            </div>
          </div>
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
    </div>
  )
}
