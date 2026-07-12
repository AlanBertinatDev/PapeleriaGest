export function linkWhatsapp(telefono: string, mensaje: string): string {
  const numero = telefono.replace(/\D/g, '')
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`
}

export function linkEmail(email: string, asunto: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(asunto)}`
}
