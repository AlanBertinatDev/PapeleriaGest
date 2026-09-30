import { useState } from 'react'
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
    <Modal title={tab === 'login' ? 'Hola de nuevo' : 'Creá tu cuenta'} onClose={onClose}>
      <div className={styles.authModal}>
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

        {tab === 'login' ? <LoginForm onSuccess={onSuccess} /> : <RegisterForm onSuccess={onSuccess} />}
      </div>
    </Modal>
  )
}
