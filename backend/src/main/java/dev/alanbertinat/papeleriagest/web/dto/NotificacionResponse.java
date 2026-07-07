package dev.alanbertinat.papeleriagest.web.dto;

import dev.alanbertinat.papeleriagest.domain.Notificacion;
import java.time.LocalDateTime;

public record NotificacionResponse(
        Long id,
        Long usuarioId,
        String nombreUsuario,
        String accionUsuario,
        String tipoNotificacion,
        LocalDateTime fecha,
        Long documentoId,
        boolean leida) {

    public static NotificacionResponse from(Notificacion notificacion) {
        return new NotificacionResponse(
                notificacion.getId(),
                notificacion.getUsuarioId(),
                notificacion.getNombreUsuario(),
                notificacion.getAccionUsuario(),
                notificacion.getTipoNotificacion(),
                notificacion.getFecha(),
                notificacion.getDocumentoId(),
                notificacion.isLeida());
    }
}
