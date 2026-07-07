package dev.alanbertinat.papeleriagest.web.dto;

import dev.alanbertinat.papeleriagest.domain.Usuario;

public record UsuarioResponse(
        Long id, String nombre, String email, String cedula, String telefono, String nivel, boolean activo) {

    public static UsuarioResponse from(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getCedula(),
                usuario.getTelefono(),
                usuario.getNivel().getNombre(),
                usuario.isActivo());
    }
}
