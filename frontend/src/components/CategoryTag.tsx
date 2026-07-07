import { categoryStyle } from '../lib/categoryColor'
import styles from './CategoryTag.module.css'

export function CategoryTag({ label, className }: { label: string; className?: string }) {
  return (
    <span className={className ? `${styles.tag} ${className}` : styles.tag} style={categoryStyle(label)}>
      {label}
    </span>
  )
}
