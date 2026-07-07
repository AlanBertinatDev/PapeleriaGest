import type { ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { NotificationCenter } from './NotificationCenter'
import logo from '../assets/logo.jpeg'

function SidebarLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <NavLink to={to} className={({ isActive }) => (isActive ? 'active' : undefined)} end={to === '/'}>
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
      <aside className="sidebar">
        <Link to={isAdmin ? '/admin/dashboard' : '/'} className="sidebar-brand">
          <img src={logo} alt="Bertinat Papelería" />
          <span>Bertinat Papelería</span>
        </Link>

        <nav className="sidebar-nav">
          {isAdmin ? (
            <div>
              <div className="sidebar-section-title">Administración</div>
              <div className="sidebar-links">
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
                <div className="sidebar-section-title">Comprar</div>
                <div className="sidebar-links">
                  <SidebarLink to="/catalogo">Catálogo</SidebarLink>
                  <SidebarLink to="/mis-pedidos">Mis pedidos</SidebarLink>
                  <SidebarLink to="/ofertas">Ofertas</SidebarLink>
                </div>
              </div>

              <div>
                <div className="sidebar-section-title">Imprimir</div>
                <div className="sidebar-links">
                  <SidebarLink to="/buscar-materiales">Buscar materiales</SidebarLink>
                  <SidebarLink to="/mis-documentos">Mis documentos</SidebarLink>
                </div>
              </div>

              {isDocente && (
                <div>
                  <div className="sidebar-section-title">Docencia</div>
                  <div className="sidebar-links">
                    <SidebarLink to="/docente/materiales">Cargar material</SidebarLink>
                  </div>
                </div>
              )}
            </>
          )}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{usuario.nombre}</span>
            <span className="sidebar-user-role">{usuario.nivel}</span>
          </div>
          <button className="secondary" onClick={handleLogout} style={{ marginLeft: 10 }}>
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
