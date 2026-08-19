export function estadoBadgeClass(estado: string): string {
  const normalizado = estado.toLowerCase()
  return `badge badge-${normalizado}`
}

const ESTADO_LABELS: Record<string, string> = {
  EN_REVISION: 'En revisión',
}

function estadoLabel(estado: string): string {
  return ESTADO_LABELS[estado] ?? estado
}

type Variant = 'soft' | 'filled' | 'outline'

export function EstadoBadge({ estado, variant = 'soft' }: { estado: string; variant?: Variant }) {
  const normalizado = estado.toLowerCase()
  const label = estadoLabel(estado)
  if (variant === 'filled') {
    return <span className={`order-status-badge order-status-badge-${normalizado}`}>{label}</span>
  }
  if (variant === 'outline') {
    return <span className={`order-item-tag order-item-tag-${normalizado}`}>{label}</span>
  }
  return <span className={estadoBadgeClass(estado)}>{label}</span>
}
