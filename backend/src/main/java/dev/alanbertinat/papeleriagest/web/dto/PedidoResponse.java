package dev.alanbertinat.papeleriagest.web.dto;

import dev.alanbertinat.papeleriagest.domain.Pedido;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record PedidoResponse(
        Long id,
        LocalDateTime fechaPedido,
        LocalDate fechaEntrega,
        String horaEntrega,
        boolean esEnvio,
        String direccion,
        String descripcion,
        String estado,
        String motivoRevision,
        LocalDateTime actualizadoEn,
        BigDecimal precio,
        Long usuarioId,
        String usuarioNombre,
        String usuarioEmail,
        String usuarioTelefono,
        List<PedidoItemResponse> items,
        List<DocumentoResponse> documentos) {

    public static PedidoResponse from(Pedido pedido) {
        return new PedidoResponse(
                pedido.getId(),
                pedido.getFechaPedido(),
                pedido.getFechaEntrega(),
                pedido.getHoraEntrega(),
                pedido.isEsEnvio(),
                pedido.getDireccion(),
                pedido.getDescripcion(),
                pedido.getEstado().name(),
                pedido.getMotivoRevision(),
                pedido.getActualizadoEn(),
                pedido.getPrecio(),
                pedido.getUsuario().getId(),
                pedido.getUsuario().getNombre(),
                pedido.getUsuario().getEmail(),
                pedido.getUsuario().getTelefono(),
                pedido.getItems().stream().map(PedidoItemResponse::from).toList(),
                pedido.getDocumentos().stream().map(DocumentoResponse::from).toList());
    }
}
