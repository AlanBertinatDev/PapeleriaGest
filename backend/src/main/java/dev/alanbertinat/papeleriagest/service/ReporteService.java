package dev.alanbertinat.papeleriagest.service;

import dev.alanbertinat.papeleriagest.exception.ConflictException;
import dev.alanbertinat.papeleriagest.repository.DocumentoRepository;
import dev.alanbertinat.papeleriagest.repository.PedidoItemRepository;
import dev.alanbertinat.papeleriagest.repository.PedidoRepository;
import dev.alanbertinat.papeleriagest.web.dto.ProductoMasVendidoResponse;
import dev.alanbertinat.papeleriagest.web.dto.ResumenReporteResponse;
import dev.alanbertinat.papeleriagest.web.dto.UsuarioConteoResponse;
import dev.alanbertinat.papeleriagest.web.dto.UsuarioGastoResponse;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReporteService {

    private static final int TOP_N = 5;

    private final PedidoItemRepository pedidoItemRepository;
    private final PedidoRepository pedidoRepository;
    private final DocumentoRepository documentoRepository;

    public ReporteService(
            PedidoItemRepository pedidoItemRepository,
            PedidoRepository pedidoRepository,
            DocumentoRepository documentoRepository) {
        this.pedidoItemRepository = pedidoItemRepository;
        this.pedidoRepository = pedidoRepository;
        this.documentoRepository = documentoRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductoMasVendidoResponse> productosMasVendidos(LocalDate desde, LocalDate hasta) {
        validarRango(desde, hasta);
        return pedidoItemRepository.productosMasVendidos(
                desde.atStartOfDay(), hasta.atTime(23, 59, 59), PageRequest.of(0, TOP_N));
    }

    @Transactional(readOnly = true)
    public List<UsuarioConteoResponse> usuariosConMasPedidos(LocalDate desde, LocalDate hasta) {
        validarRango(desde, hasta);
        return pedidoRepository.usuariosConMasPedidos(
                desde.atStartOfDay(), hasta.atTime(23, 59, 59), PageRequest.of(0, TOP_N));
    }

    @Transactional(readOnly = true)
    public List<UsuarioGastoResponse> usuariosConMasGasto(LocalDate desde, LocalDate hasta) {
        validarRango(desde, hasta);
        return pedidoRepository.usuariosConMasGasto(
                desde.atStartOfDay(), hasta.atTime(23, 59, 59), PageRequest.of(0, TOP_N));
    }

    @Transactional(readOnly = true)
    public List<UsuarioConteoResponse> usuariosConMasDocumentos(LocalDate desde, LocalDate hasta) {
        validarRango(desde, hasta);
        return documentoRepository.usuariosConMasDocumentos(desde, hasta, PageRequest.of(0, TOP_N));
    }

    @Transactional(readOnly = true)
    public ResumenReporteResponse resumen(LocalDate desde, LocalDate hasta) {
        validarRango(desde, hasta);
        LocalDateTime desdeInicio = desde.atStartOfDay();
        LocalDateTime hastaFin = hasta.atTime(23, 59, 59);
        return new ResumenReporteResponse(
                pedidoRepository.sumarIngresosEnRango(desdeInicio, hastaFin),
                pedidoRepository.contarPedidosEnRango(desdeInicio, hastaFin),
                documentoRepository.countByFechaIngresoBetween(desde, hasta));
    }

    private void validarRango(LocalDate desde, LocalDate hasta) {
        if (hasta.isBefore(desde)) {
            throw new ConflictException("La fecha \"hasta\" no puede ser anterior a la fecha \"desde\"");
        }
    }
}
