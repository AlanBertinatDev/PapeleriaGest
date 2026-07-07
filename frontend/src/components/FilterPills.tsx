import styles from './FilterPills.module.css'

interface FilterOption {
  key: string
  label: string
  count?: number
}

export function FilterPills({
  options,
  active,
  onChange,
  className,
}: {
  options: FilterOption[]
  active: string
  onChange: (key: string) => void
  className?: string
}) {
  return (
    <div className={className ? `${styles.track} ${className}` : styles.track}>
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          className={active === opt.key ? `${styles.tab} ${styles.active}` : styles.tab}
          onClick={() => onChange(opt.key)}
        >
          {opt.label}
          {opt.count !== undefined && <span className={styles.count}>{opt.count}</span>}
        </button>
      ))}
    </div>
  )
}
