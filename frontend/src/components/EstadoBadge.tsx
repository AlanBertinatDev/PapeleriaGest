export function estadoBadgeClass(estado: string): string {
  const normalizado = estado.toLowerCase()
  return `badge badge-${normalizado}`
}

export function EstadoBadge({ estado }: { estado: string }) {
  return <span className={estadoBadgeClass(estado)}>{estado}</span>
}
