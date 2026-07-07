import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Modal } from './Modal'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import styles from './AuthModal.module.css'

export type AuthTab = 'login' | 'register'

export function AuthModal({
  initialTab,
  onClose,
  onSuccess,
}: {
  initialTab: AuthTab
  onClose: () => void
  onSuccess: () => void
}) {
  const [tab, setTab] = useState<AuthTab>(initialTab)

  return (
    <Modal title={tab === 'login' ? 'Ingresá a tu cuenta' : 'Creá tu cuenta'} onClose={onClose}>
      <div className={styles.tabs}>
        <button
          type="button"
          className={tab === 'login' ? styles.tabActive : styles.tab}
          onClick={() => setTab('login')}
        >
          Ingresar
        </button>
        <button
          type="button"
          className={tab === 'register' ? styles.tabActive : styles.tab}
          onClick={() => setTab('register')}
        >
          Registrarme
        </button>
      </div>

      {tab === 'login' ? (
        <>
          <LoginForm onSuccess={onSuccess} />
          <p className={styles.switchHint}>
            ¿No tenés cuenta?{' '}
            <Link to="/registrarse" onClick={() => setTab('register')}>
              Registrate
            </Link>
          </p>
        </>
      ) : (
        <>
          <RegisterForm onSuccess={onSuccess} />
          <p className={styles.switchHint}>
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" onClick={() => setTab('login')}>
              Ingresá
            </Link>
          </p>
        </>
      )}
    </Modal>
  )
}
