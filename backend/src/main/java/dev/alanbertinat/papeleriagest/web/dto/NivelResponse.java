package dev.alanbertinat.papeleriagest.web.dto;

import dev.alanbertinat.papeleriagest.domain.Nivel;

public record NivelResponse(Long id, String nombre) {

    public static NivelResponse from(Nivel nivel) {
        return new NivelResponse(nivel.getId(), nivel.getNombre());
    }
}
