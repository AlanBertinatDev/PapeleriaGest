package dev.alanbertinat.papeleriagest.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UpdatePerfilRequest(
        @NotBlank String nombre,
        @NotBlank @Email String email,
        String telefono) {
}
