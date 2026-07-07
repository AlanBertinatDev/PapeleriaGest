import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { PageHeader } from '../components/PageHeader'

export function HomePage() {
  const { usuario, isAdmin, isDocente } = useAuth()

  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return (
    <div>
      <PageHeader title={`Hola, ${usuario?.nombre}`} subtitle="¿Qué querés hacer hoy?" />

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
