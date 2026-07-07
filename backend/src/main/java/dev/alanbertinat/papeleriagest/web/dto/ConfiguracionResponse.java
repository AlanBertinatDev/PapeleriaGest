package dev.alanbertinat.papeleriagest.web.dto;

import dev.alanbertinat.papeleriagest.domain.Configuracion;

public record ConfiguracionResponse(Long id, String nombre, String valor) {

    public static ConfiguracionResponse from(Configuracion configuracion) {
        return new ConfiguracionResponse(configuracion.getId(), configuracion.getNombre(), configuracion.getValor());
    }
}
