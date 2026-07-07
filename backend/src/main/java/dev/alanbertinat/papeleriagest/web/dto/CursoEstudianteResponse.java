package dev.alanbertinat.papeleriagest.web.dto;

import dev.alanbertinat.papeleriagest.domain.CursoEstudiante;

public record CursoEstudianteResponse(Long id, Long cursoId, Long estudianteId, String estudianteNombre) {

    public static CursoEstudianteResponse from(CursoEstudiante ce) {
        return new CursoEstudianteResponse(
                ce.getId(), ce.getCurso().getId(), ce.getEstudiante().getId(), ce.getEstudiante().getNombre());
    }
}
