package dev.alanbertinat.papeleriagest.web.dto;

import java.util.List;

public record DashboardResponse(
        long pedidosPendientes,
        long documentosPendientes,
        List<ProductoResponse> productosConStockBajo) {
}
