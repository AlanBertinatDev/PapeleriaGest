package dev.alanbertinat.papeleriagest.web.controller;

import dev.alanbertinat.papeleriagest.service.NotificacionService;
import dev.alanbertinat.papeleriagest.web.dto.NotificacionResponse;
import java.util.List;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notificaciones")
@PreAuthorize("hasRole('ADMIN')")
public class NotificacionController {

    private final NotificacionService notificacionService;

    public NotificacionController(NotificacionService notificacionService) {
        this.notificacionService = notificacionService;
    }

    @GetMapping
    public List<NotificacionResponse> ultimas() {
        return notificacionService.ultimas();
    }

    @GetMapping("/no-leidas")
    public List<NotificacionResponse> noLeidas() {
        return notificacionService.noLeidas();
    }

    @GetMapping("/no-leidas/conteo")
    public Map<String, Long> contarNoLeidas() {
        return Map.of("conteo", notificacionService.contarNoLeidas());
    }

    @PutMapping("/{id}/leida")
    public void marcarLeida(@PathVariable Long id) {
        notificacionService.marcarLeida(id);
    }

    @PutMapping("/leer-todas")
    public void marcarTodasLeidas() {
        notificacionService.marcarTodasLeidas();
    }
}
