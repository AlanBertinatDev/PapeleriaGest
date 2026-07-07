import { useEffect, useState } from 'react'
import { obtenerImagenComoObjectUrl } from '../api/client'

export function AuthImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelado = false
    let url: string | null = null
    obtenerImagenComoObjectUrl(src)
      .then((u) => {
        if (cancelado) {
          URL.revokeObjectURL(u)
          return
        }
        url = u
        setObjectUrl(u)
      })
      .catch(() => {})
    return () => {
      cancelado = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [src])

  if (!objectUrl) {
    return <div className={`${className ?? ''} image-placeholder`} aria-label={alt} />
  }

  return <img src={objectUrl} alt={alt} className={className} />
}
