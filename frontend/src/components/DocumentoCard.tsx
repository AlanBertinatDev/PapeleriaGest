import { documentosApi, type DocumentoResponse } from '../api/documentos'
import { EstadoBadge } from './EstadoBadge'

interface DocumentoCardProps {
  documento: DocumentoResponse
  mostrarUsuario?: boolean
  acciones?: { label: string; onClick: () => void; destacada?: boolean }[]
}

export function DocumentoCard({ documento, mostrarUsuario, acciones }: DocumentoCardProps) {
  return (
    <div className={`order-card estado-${documento.estado.toLowerCase()}`}>
      <div className="order-card-header">
        <div>
          <div className="order-card-title">{documento.nombre}</div>
          <div className="order-card-meta">
            {mostrarUsuario && <>{documento.usuarioNombre} · </>}
            {new Date(documento.fechaIngreso).toLocaleDateString()}
            {documento.cursoNombre && <> · {documento.cursoNombre}</>}
          </div>
        </div>
        <EstadoBadge estado={documento.estado} />
      </div>

      <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-soft)' }}>
        {documento.materia && <>Materia: {documento.materia} · </>}
        {documento.cantidadCopias} copia{documento.cantidadCopias === 1 ? '' : 's'} ·{' '}
        {documento.esDobleFaz ? 'Doble faz' : 'Simple faz'} · {documento.aColor ? 'Color' : 'Blanco y negro'}
      </p>

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
