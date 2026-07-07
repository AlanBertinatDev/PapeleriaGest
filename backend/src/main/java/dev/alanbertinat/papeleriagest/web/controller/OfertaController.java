package dev.alanbertinat.papeleriagest.web.controller;

import dev.alanbertinat.papeleriagest.security.UsuarioPrincipal;
import dev.alanbertinat.papeleriagest.service.OfertaService;
import dev.alanbertinat.papeleriagest.web.dto.OfertaRequest;
import dev.alanbertinat.papeleriagest.web.dto.OfertaResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ofertas")
public class OfertaController {

    private final OfertaService ofertaService;

    public OfertaController(OfertaService ofertaService) {
        this.ofertaService = ofertaService;
    }

    @GetMapping
    public List<OfertaResponse> listarVigentes() {
        return ofertaService.listarVigentes();
    }

    @GetMapping("/todas")
    @PreAuthorize("hasRole('ADMIN')")
    public List<OfertaResponse> listarTodas() {
        return ofertaService.listarTodas();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OfertaResponse> crear(
            @AuthenticationPrincipal UsuarioPrincipal principal, @Valid @RequestBody OfertaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ofertaService.crear(principal.usuario(), request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        ofertaService.desactivar(id);
        return ResponseEntity.noContent().build();
    }
}
