import styles from './DiscountPreview.module.css'

export function DiscountPreview({
  precioOriginal,
  precioPromocional,
}: {
  precioOriginal: number | null
  precioPromocional: number | null
}) {
  if (!precioOriginal || precioOriginal <= 0 || !precioPromocional || precioPromocional <= 0) {
    return null
  }

  const porcentaje = Math.round(100 - (precioPromocional / precioOriginal) * 100)

  return (
    <div className={styles.card}>
      <div className={styles.label}>Vista previa del descuento</div>
      <div className={styles.row}>
        <span className={styles.original}>${precioOriginal}</span>
        <span className={styles.promo}>${precioPromocional}</span>
        {porcentaje > 0 && <span className={styles.badge}>-{porcentaje}%</span>}
      </div>
    </div>
  )
}
