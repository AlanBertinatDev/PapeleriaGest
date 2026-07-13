import { api } from './client'

export interface UsuarioResponse {
  id: number
  nombre: string
  email: string
  cedula: string
  telefono: string | null
  nivel: string
  activo: boolean
}

export interface AuthResponse {
  token: string
  usuario: UsuarioResponse
}

export interface RegisterRequest {
  nombre: string
  email: string
  cedula: string
  telefono?: string | null
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface UpdatePerfilRequest {
  nombre: string
  email: string
  telefono?: string | null
}

export const authApi = {
  register: (data: RegisterRequest) => api.post<AuthResponse>('/auth/register', data),
  login: (data: LoginRequest) => api.post<AuthResponse>('/auth/login', data),
  me: () => api.get<UsuarioResponse>('/auth/me'),
  actualizarPerfil: (data: UpdatePerfilRequest) => api.put<UsuarioResponse>('/auth/me', data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put<void>('/auth/password', { currentPassword, newPassword }),
}
