export function estadoBadgeClass(estado: string): string {
  const normalizado = estado.toLowerCase()
  return `badge badge-${normalizado}`
}

type Variant = 'soft' | 'filled' | 'outline'

export function EstadoBadge({ estado, variant = 'soft' }: { estado: string; variant?: Variant }) {
  const normalizado = estado.toLowerCase()
  if (variant === 'filled') {
    return <span className={`order-status-badge order-status-badge-${normalizado}`}>{estado}</span>
  }
  if (variant === 'outline') {
    return <span className={`order-item-tag order-item-tag-${normalizado}`}>{estado}</span>
  }
  return <span className={estadoBadgeClass(estado)}>{estado}</span>
}
