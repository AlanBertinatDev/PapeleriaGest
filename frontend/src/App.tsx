import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { ProtectedRoute, AdminRoute, DocenteRoute } from './auth/ProtectedRoute'
import { Layout } from './components/Layout'
import { LandingPage } from './pages/LandingPage'
import { HomePage } from './pages/HomePage'
import { CatalogoPage } from './pages/CatalogoPage'
import { MisPedidosPage } from './pages/MisPedidosPage'
import { OfertasPage } from './pages/OfertasPage'
import { MisDocumentosPage } from './pages/MisDocumentosPage'
import { BuscarMaterialesPage } from './pages/BuscarMaterialesPage'
import { CargarMaterialPage } from './pages/docente/CargarMaterialPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminProductosPage } from './pages/admin/AdminProductosPage'
import { AdminProductoDetallePage } from './pages/admin/AdminProductoDetallePage'
import { AdminPedidosPage } from './pages/admin/AdminPedidosPage'
import { AdminOfertasPage } from './pages/admin/AdminOfertasPage'
import { AdminFotosHomePage } from './pages/admin/AdminFotosHomePage'
import { AdminDocumentosPage } from './pages/admin/AdminDocumentosPage'
import { AdminCursosPage } from './pages/admin/AdminCursosPage'
import { AdminUsuariosPage } from './pages/admin/AdminUsuariosPage'
import { AdminReportesPage } from './pages/admin/AdminReportesPage'
import { AdminConfiguracionPage } from './pages/admin/AdminConfiguracionPage'

function RootRoute() {
  const { usuario, loading } = useAuth()
  if (loading) return null
  return usuario ? <HomePage /> : <LandingPage />
}

function GuestOnlyRoute() {
  const { usuario, loading } = useAuth()
  if (loading) return null
  if (usuario) return <Navigate to="/" replace />
  return <LandingPage />
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/login" element={<GuestOnlyRoute />} />
            <Route path="/registrarse" element={<GuestOnlyRoute />} />
            <Route path="/" element={<RootRoute />} />
            <Route
              path="/catalogo"
              element={
                <ProtectedRoute>
                  <CatalogoPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mis-pedidos"
              element={
                <ProtectedRoute>
                  <MisPedidosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ofertas"
              element={
                <ProtectedRoute>
                  <OfertasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buscar-materiales"
              element={
                <ProtectedRoute>
                  <BuscarMaterialesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mis-documentos"
              element={
                <ProtectedRoute>
                  <MisDocumentosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/docente/materiales"
              element={
                <DocenteRoute>
                  <CargarMaterialPage />
                </DocenteRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/productos"
              element={
                <AdminRoute>
                  <AdminProductosPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/productos/nuevo"
              element={
                <AdminRoute>
                  <AdminProductoDetallePage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/productos/:codigo"
              element={
                <AdminRoute>
                  <AdminProductoDetallePage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/pedidos"
              element={
                <AdminRoute>
                  <AdminPedidosPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/ofertas"
              element={
                <AdminRoute>
                  <AdminOfertasPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/fotos-home"
              element={
                <AdminRoute>
                  <AdminFotosHomePage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/documentos"
              element={
                <AdminRoute>
                  <AdminDocumentosPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/cursos"
              element={
                <AdminRoute>
                  <AdminCursosPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/usuarios"
              element={
                <AdminRoute>
                  <AdminUsuariosPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/reportes"
              element={
                <AdminRoute>
                  <AdminReportesPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/configuracion"
              element={
                <AdminRoute>
                  <AdminConfiguracionPage />
                </AdminRoute>
              }
            />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
