package dev.alanbertinat.papeleriagest.web.dto;

import java.math.BigDecimal;

public record UsuarioGastoResponse(Long usuarioId, String usuarioNombre, BigDecimal totalGastado) {
}
