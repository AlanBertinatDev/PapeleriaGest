package dev.alanbertinat.papeleriagest.web.dto;

import dev.alanbertinat.papeleriagest.domain.MateriaCursoDocente;

public record MateriaCursoDocenteResponse(
        Long id, Long cursoId, String cursoNombre, Long docenteId, String docenteNombre, String materia) {

    public static MateriaCursoDocenteResponse from(MateriaCursoDocente mcd) {
        return new MateriaCursoDocenteResponse(
                mcd.getId(),
                mcd.getCurso().getId(),
                mcd.getCurso().getGrado() + " " + mcd.getCurso().getGrupo(),
                mcd.getDocente().getId(),
                mcd.getDocente().getNombre(),
                mcd.getMateria());
    }
}
