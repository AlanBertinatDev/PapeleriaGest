package dev.alanbertinat.papeleriagest.web.controller;

import dev.alanbertinat.papeleriagest.security.UsuarioPrincipal;
import dev.alanbertinat.papeleriagest.service.PedidoService;
import dev.alanbertinat.papeleriagest.web.dto.CambiarEstadoPedidoRequest;
import dev.alanbertinat.papeleriagest.web.dto.CrearPedidoRequest;
import dev.alanbertinat.papeleriagest.web.dto.PedidoResponse;
import dev.alanbertinat.papeleriagest.web.dto.TarifasResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @PostMapping
    public ResponseEntity<PedidoResponse> crear(
            @AuthenticationPrincipal UsuarioPrincipal principal, @Valid @RequestBody CrearPedidoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(pedidoService.crear(principal.usuario(), request));
    }

    @GetMapping("/tarifas")
    public TarifasResponse tarifas() {
        return pedidoService.obtenerTarifas();
    }

    @GetMapping("/mios")
    public List<PedidoResponse> listarMios(@AuthenticationPrincipal UsuarioPrincipal principal) {
        return pedidoService.listarMios(principal.usuario());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<PedidoResponse> listarTodos() {
        return pedidoService.listarTodos();
    }

    @GetMapping("/{id}")
    public PedidoResponse buscar(@AuthenticationPrincipal UsuarioPrincipal principal, @PathVariable Long id) {
        return pedidoService.buscar(id, principal.usuario());
    }

    @PutMapping("/{id}/cancelar")
    public PedidoResponse cancelar(@AuthenticationPrincipal UsuarioPrincipal principal, @PathVariable Long id) {
        return pedidoService.cancelar(id, principal.usuario());
    }

    @PutMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMIN')")
    public PedidoResponse cambiarEstado(
            @PathVariable Long id, @Valid @RequestBody CambiarEstadoPedidoRequest request) {
        return pedidoService.cambiarEstado(id, request.estado());
    }
}
