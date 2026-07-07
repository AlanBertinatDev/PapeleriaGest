import type { CSSProperties } from 'react'

const HUES = [20, 70, 155, 230]

export function hueForLabel(label: string): number {
  let hash = 0
  for (let i = 0; i < label.length; i++) {
    hash = (hash * 31 + label.charCodeAt(i)) | 0
  }
  return HUES[Math.abs(hash) % HUES.length]
}

export function categoryStyle(label: string): CSSProperties {
  return { '--h': hueForLabel(label) } as CSSProperties
}

export function categoryTintColor(label: string, lightness = 0.97, chroma = 0.012): string {
  return `oklch(${lightness} ${chroma} ${hueForLabel(label)})`
}

export function categoryBorderColor(label: string, lightness = 0.8, chroma = 0.11): string {
  return `oklch(${lightness} ${chroma} ${hueForLabel(label)})`
}
