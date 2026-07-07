package dev.alanbertinat.papeleriagest.web.dto;

import java.math.BigDecimal;

public record ResumenReporteResponse(BigDecimal ingresosTotales, long totalPedidos, long totalDocumentos) {
}
