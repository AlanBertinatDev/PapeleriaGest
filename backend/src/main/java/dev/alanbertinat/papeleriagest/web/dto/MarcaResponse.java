package dev.alanbertinat.papeleriagest.web.dto;

import dev.alanbertinat.papeleriagest.domain.Marca;

public record MarcaResponse(Long id, String nombre) {

    public static MarcaResponse from(Marca marca) {
        return new MarcaResponse(marca.getId(), marca.getNombre());
    }
}
