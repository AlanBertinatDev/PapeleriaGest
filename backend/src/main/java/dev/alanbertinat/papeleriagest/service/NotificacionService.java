package dev.alanbertinat.papeleriagest.service;

import dev.alanbertinat.papeleriagest.domain.Notificacion;
import dev.alanbertinat.papeleriagest.domain.Usuario;
import dev.alanbertinat.papeleriagest.exception.ResourceNotFoundException;
import dev.alanbertinat.papeleriagest.repository.NotificacionRepository;
import dev.alanbertinat.papeleriagest.web.dto.NotificacionResponse;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;

    public NotificacionService(NotificacionRepository notificacionRepository) {
        this.notificacionRepository = notificacionRepository;
    }

    @Transactional
    public void registrarPedido(Usuario usuario, String accion) {
        registrar(usuario, accion, "Notificaciones Pedido", null);
    }

    @Transactional
    public void registrarDocumento(Usuario usuario, String accion, Long documentoId) {
        registrar(usuario, accion, "Notificaciones Documentos", documentoId);
    }

    private void registrar(Usuario usuario, String accion, String tipo, Long documentoId) {
        Notificacion notificacion = Notificacion.builder()
                .usuarioId(usuario.getId())
                .nombreUsuario(usuario.getNombre())
                .accionUsuario(accion)
                .tipoNotificacion(tipo)
                .fecha(LocalDateTime.now())
                .documentoId(documentoId)
                .leida(false)
                .build();
        notificacionRepository.save(notificacion);
    }

    @Transactional(readOnly = true)
    public List<NotificacionResponse> ultimas() {
        return notificacionRepository.findByOrderByFechaDesc(PageRequest.of(0, 20)).stream()
                .map(NotificacionResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NotificacionResponse> noLeidas() {
        return notificacionRepository.findByLeidaFalseOrderByFechaDesc().stream()
                .map(NotificacionResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public long contarNoLeidas() {
        return notificacionRepository.countByLeidaFalse();
    }

    @Transactional
    public void marcarLeida(Long id) {
        Notificacion notificacion = notificacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notificación no encontrada: " + id));
        notificacion.setLeida(true);
        notificacionRepository.save(notificacion);
    }

    @Transactional
    public void marcarTodasLeidas() {
        notificacionRepository.findByLeidaFalseOrderByFechaDesc()
                .forEach(n -> n.setLeida(true));
    }
}
