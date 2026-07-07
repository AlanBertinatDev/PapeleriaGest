import { useRef, useState, type DragEvent } from 'react'
import styles from './ImageDropzone.module.css'

export function ImageDropzone({
  previewUrl,
  onFileSelected,
  disabled,
}: {
  previewUrl?: string | null
  onFileSelected: (file: File) => void
  disabled?: boolean
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [dragging, setDragging] = useState(false)

  function handleDrop(e: DragEvent<HTMLButtonElement>) {
    e.preventDefault()
    setDragging(false)
    const archivo = e.dataTransfer.files?.[0]
    if (archivo) onFileSelected(archivo)
  }

  return (
    <div>
      <label>Imagen de la oferta</label>
      <button
        type="button"
        className={dragging ? `${styles.zone} ${styles.dragging}` : styles.zone}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        disabled={disabled}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Vista previa" className={styles.preview} />
        ) : (
          <>
            <span className={styles.icon}>🖼️</span>
            <span className={styles.label}>Arrastrar foto o elegir archivo</span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className={styles.input}
        onChange={(e) => {
          const archivo = e.target.files?.[0]
          if (archivo) onFileSelected(archivo)
          e.target.value = ''
        }}
      />
    </div>
  )
}
