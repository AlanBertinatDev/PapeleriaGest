package dev.alanbertinat.papeleriagest.web.dto;

import dev.alanbertinat.papeleriagest.domain.MateriaCursoDocente;

public record MateriaCursoDocenteResponse(
        Long id, Long cursoId, Long docenteId, String docenteNombre, String materia) {

    public static MateriaCursoDocenteResponse from(MateriaCursoDocente mcd) {
        return new MateriaCursoDocenteResponse(
                mcd.getId(),
                mcd.getCurso().getId(),
                mcd.getDocente().getId(),
                mcd.getDocente().getNombre(),
                mcd.getMateria());
    }
}
