package dev.alanbertinat.papeleriagest.web.dto;

import dev.alanbertinat.papeleriagest.domain.CategoriaProducto;

public record CategoriaProductoResponse(Long id, String nombre, int porcentaje) {

    public static CategoriaProductoResponse from(CategoriaProducto categoria) {
        return new CategoriaProductoResponse(categoria.getId(), categoria.getNombre(), categoria.getPorcentaje());
    }
}
