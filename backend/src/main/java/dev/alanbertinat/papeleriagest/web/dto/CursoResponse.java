package dev.alanbertinat.papeleriagest.web.dto;

import dev.alanbertinat.papeleriagest.domain.Curso;

public record CursoResponse(Long id, String grado, String grupo) {

    public static CursoResponse from(Curso curso) {
        return new CursoResponse(curso.getId(), curso.getGrado(), curso.getGrupo());
    }
}
