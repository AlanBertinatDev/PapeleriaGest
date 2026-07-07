import { useEffect, useRef, useState } from 'react'
import { fotosHomeApi, type FotoHomeResponse } from '../../api/fotosHome'
import { ApiError } from '../../api/client'
import { AuthImage } from '../../components/AuthImage'
import { PageHeader } from '../../components/PageHeader'
import styles from './AdminFotosHomePage.module.css'

export function AdminFotosHomePage() {
  const [fotos, setFotos] = useState<FotoHomeResponse[]>([])
  const [error, setError] = useState<string | null>(null)
  const [subiendo, setSubiendo] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  function cargar() {
    fotosHomeApi
      .listar()
      .then(setFotos)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'No se pudieron cargar las fotos'))
  }

  useEffect(cargar, [])

  async function handleFile(archivo: File) {
    setError(null)
    setSubiendo(true)
    try {
      await fotosHomeApi.subir(archivo)
      cargar()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo subir la foto')
    } finally {
      setSubiendo(false)
    }
  }

  async function handleEliminar(id: number) {
    try {
      await fotosHomeApi.eliminar(id)
      cargar()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar la foto')
    }
  }

  return (
    <div>
      <PageHeader
        title="Fotos del home"
        subtitle="Fotos propias del negocio que rotan en la portada de la foto destacada, sin precio ni vigencia"
      />
      {error && <p className="error">{error}</p>}

      <div className={styles.grid}>
        <button
          type="button"
          className={styles.uploadTile}
          onClick={() => inputRef.current?.click()}
          disabled={subiendo}
        >
          <span className={styles.uploadIcon}>🖼️</span>
          <span>{subiendo ? 'Subiendo...' : '+ Subir foto'}</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className={styles.hiddenInput}
          onChange={(e) => {
            const archivo = e.target.files?.[0]
            if (archivo) handleFile(archivo)
            e.target.value = ''
          }}
        />

        {fotos.map((foto) => (
          <div className={styles.tile} key={foto.id}>
            <AuthImage src={`/fotos-home/${foto.id}/imagen`} alt={`Foto subida por ${foto.usuarioNombre}`} />
            <button
              type="button"
              className={styles.deleteBtn}
              onClick={() => handleEliminar(foto.id)}
              aria-label="Eliminar foto"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {fotos.length === 0 && <p className="empty-state">No hay fotos cargadas todavía.</p>}
    </div>
  )
}
