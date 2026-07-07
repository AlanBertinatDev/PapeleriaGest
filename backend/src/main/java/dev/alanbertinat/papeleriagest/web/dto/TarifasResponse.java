package dev.alanbertinat.papeleriagest.web.dto;

import java.math.BigDecimal;

public record TarifasResponse(BigDecimal costoEnvio, BigDecimal costoCopiaBn, BigDecimal costoCopiaColor) {
}
