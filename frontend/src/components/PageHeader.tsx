import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import styles from './PageHeader.module.css'

interface Breadcrumb {
  label: string
  to?: string
}

export function PageHeader({
  title,
  subtitle,
  action,
  breadcrumb,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  breadcrumb?: Breadcrumb[]
}) {
  return (
    <>
      {breadcrumb && (
        <div className={styles.breadcrumb}>
          {breadcrumb.map((crumb, i) => (
            <span key={i} style={{ display: 'contents' }}>
              {i > 0 && <span>/</span>}
              {crumb.to ? (
                <Link to={crumb.to}>{crumb.label}</Link>
              ) : (
                <span className={styles.breadcrumbCurrent}>{crumb.label}</span>
              )}
            </span>
          ))}
        </div>
      )}
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <div className={styles.title}>{title}</div>
          {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
        </div>
        {action && <div className={styles.actions}>{action}</div>}
      </div>
    </>
  )
}
