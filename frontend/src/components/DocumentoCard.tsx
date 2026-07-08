import { documentosApi, type DocumentoResponse } from '../api/documentos'

interface DocumentoCardProps {
  documento: DocumentoResponse
  mostrarUsuario?: boolean
  acciones?: { label: string; onClick: () => void; destacada?: boolean }[]
}

export function DocumentoCard({ documento, mostrarUsuario, acciones }: DocumentoCardProps) {
  return (
    <div className="order-card">
      <div className="order-card-header">
        <div>
          <div className="order-card-title">{documento.nombre}</div>
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
