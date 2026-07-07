package dev.alanbertinat.papeleriagest.web.dto;

import dev.alanbertinat.papeleriagest.domain.FotoHome;
import java.time.LocalDate;

public record FotoHomeResponse(Long id, LocalDate fechaCarga, String usuarioNombre) {

    public static FotoHomeResponse from(FotoHome foto) {
        return new FotoHomeResponse(foto.getId(), foto.getFechaCarga(), foto.getUsuario().getNombre());
    }
}
