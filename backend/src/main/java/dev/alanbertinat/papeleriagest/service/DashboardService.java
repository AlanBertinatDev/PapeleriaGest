package dev.alanbertinat.papeleriagest.service;

import dev.alanbertinat.papeleriagest.domain.EstadoDocumento;
import dev.alanbertinat.papeleriagest.domain.EstadoPedido;
import dev.alanbertinat.papeleriagest.repository.DocumentoRepository;
import dev.alanbertinat.papeleriagest.repository.PedidoRepository;
import dev.alanbertinat.papeleriagest.repository.ProductoRepository;
import dev.alanbertinat.papeleriagest.web.dto.DashboardResponse;
import dev.alanbertinat.papeleriagest.web.dto.ProductoResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private final PedidoRepository pedidoRepository;
    private final DocumentoRepository documentoRepository;
    private final ProductoRepository productoRepository;

    public DashboardService(
            PedidoRepository pedidoRepository,
            DocumentoRepository documentoRepository,
            ProductoRepository productoRepository) {
        this.pedidoRepository = pedidoRepository;
        this.documentoRepository = documentoRepository;
        this.productoRepository = productoRepository;
    }

    @Transactional(readOnly = true)
    public DashboardResponse obtener() {
        long pedidosPendientes = pedidoRepository.countByActivoTrueAndEstado(EstadoPedido.PENDIENTE);
        long documentosPendientes = documentoRepository.countByActivoTrueAndEstadoAndPedidoIsNotNull(EstadoDocumento.PENDIENTE);
        var stockBajo = productoRepository.findConStockBajo().stream().map(ProductoResponse::from).toList();
        return new DashboardResponse(pedidosPendientes, documentosPendientes, stockBajo);
    }
}
