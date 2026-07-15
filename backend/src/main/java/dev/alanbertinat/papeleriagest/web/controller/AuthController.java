package dev.alanbertinat.papeleriagest.web.controller;

import dev.alanbertinat.papeleriagest.security.UsuarioPrincipal;
import dev.alanbertinat.papeleriagest.service.AuthService;
import dev.alanbertinat.papeleriagest.web.dto.AuthResponse;
import dev.alanbertinat.papeleriagest.web.dto.ChangePasswordRequest;
import dev.alanbertinat.papeleriagest.web.dto.LoginRequest;
import dev.alanbertinat.papeleriagest.web.dto.RegisterRequest;
import dev.alanbertinat.papeleriagest.web.dto.UpdatePerfilRequest;
import dev.alanbertinat.papeleriagest.web.dto.UsuarioResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioResponse> me(@AuthenticationPrincipal UsuarioPrincipal principal) {
        return ResponseEntity.ok(UsuarioResponse.from(principal.usuario()));
    }

    @PutMapping("/me")
    public ResponseEntity<UsuarioResponse> actualizarPerfil(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @Valid @RequestBody UpdatePerfilRequest request) {
        return ResponseEntity.ok(authService.actualizarPerfil(principal.usuario(), request));
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(principal.usuario(), request);
        return ResponseEntity.noContent().build();
    }
}
