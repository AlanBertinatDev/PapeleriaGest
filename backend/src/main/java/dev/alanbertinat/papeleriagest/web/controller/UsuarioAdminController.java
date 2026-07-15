package dev.alanbertinat.papeleriagest.web.controller;

import dev.alanbertinat.papeleriagest.security.UsuarioPrincipal;
import dev.alanbertinat.papeleriagest.service.UsuarioAdminService;
import dev.alanbertinat.papeleriagest.web.dto.CambiarNivelRequest;
import dev.alanbertinat.papeleriagest.web.dto.NivelResponse;
import dev.alanbertinat.papeleriagest.web.dto.ResetPasswordRequest;
import dev.alanbertinat.papeleriagest.web.dto.UsuarioResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usuarios")
@PreAuthorize("hasRole('ADMIN')")
public class UsuarioAdminController {

    private final UsuarioAdminService usuarioAdminService;

    public UsuarioAdminController(UsuarioAdminService usuarioAdminService) {
        this.usuarioAdminService = usuarioAdminService;
    }

    @GetMapping
    public List<UsuarioResponse> listar() {
        return usuarioAdminService.listar();
    }

    @GetMapping("/niveles")
    public List<NivelResponse> listarNiveles() {
        return usuarioAdminService.listarNiveles();
    }

    @PutMapping("/{id}/nivel")
    public UsuarioResponse cambiarNivel(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody CambiarNivelRequest request) {
        return usuarioAdminService.cambiarNivel(principal.usuario(), id, request.nivelId());
    }

    @PutMapping("/{id}/activar")
    public UsuarioResponse activar(@AuthenticationPrincipal UsuarioPrincipal principal, @PathVariable Long id) {
        return usuarioAdminService.cambiarActivo(principal.usuario(), id, true);
    }

    @PutMapping("/{id}/desactivar")
    public UsuarioResponse desactivar(@AuthenticationPrincipal UsuarioPrincipal principal, @PathVariable Long id) {
        return usuarioAdminService.cambiarActivo(principal.usuario(), id, false);
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<Void> resetearPassword(
            @PathVariable Long id, @Valid @RequestBody ResetPasswordRequest request) {
        usuarioAdminService.resetearPassword(id, request.newPassword());
        return ResponseEntity.noContent().build();
    }
}
