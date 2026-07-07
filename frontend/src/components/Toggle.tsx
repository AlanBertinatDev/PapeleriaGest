import styles from './Toggle.module.css'

export function Toggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean
  onChange: () => void
  disabled?: boolean
  label?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={checked ? `${styles.track} ${styles.on}` : styles.track}
    >
      <span className={styles.thumb} />
    </button>
  )
}
