import { documentosApi, type DocumentoResponse } from '../api/documentos'

interface DocumentoCardProps {
  documento: DocumentoResponse
  mostrarUsuario?: boolean
  acciones?: { label: string; onClick: () => void; destacada?: boolean }[]
}

export function DocumentoCard({ documento, mostrarUsuario, acciones }: DocumentoCardProps) {
  const esPropio = documento.origen === 'PROPIO'
  return (
    <div className={esPropio ? 'order-card documento-propio' : 'order-card'}>
      <div className="order-card-header">
        <div>
          {mostrarUsuario && (
            <span className={esPropio ? 'badge documento-tag-propio' : 'badge documento-tag-cliente'}>
              {esPropio ? 'Propio' : 'Cliente'}
            </span>
          )}
          <div className="order-card-title" style={mostrarUsuario ? { marginTop: 6 } : undefined}>
            {documento.nombre}
          </div>
          <div className="order-card-meta">
            {mostrarUsuario && <>{documento.usuarioNombre} · </>}
            {new Date(documento.fechaIngreso).toLocaleDateString()}
            {documento.cursoNombre && <> · {documento.cursoNombre}</>}
            {documento.materia && <> · {documento.materia}</>}
          </div>
        </div>
      </div>

      <div className="order-card-actions">
        <button className="secondary" onClick={() => documentosApi.descargar(documento)}>
          Ver archivo
        </button>
        {acciones?.map((accion) => (
          <button key={accion.label} className={accion.destacada ? undefined : 'secondary'} onClick={accion.onClick}>
            {accion.label}
          </button>
        ))}
      </div>
    </div>
  )
}
