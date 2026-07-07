package dev.alanbertinat.papeleriagest.web.controller;

import dev.alanbertinat.papeleriagest.service.CursoService;
import dev.alanbertinat.papeleriagest.web.dto.AsignarDocenteRequest;
import dev.alanbertinat.papeleriagest.web.dto.AsignarEstudianteRequest;
import dev.alanbertinat.papeleriagest.web.dto.CursoEstudianteResponse;
import dev.alanbertinat.papeleriagest.web.dto.CursoRequest;
import dev.alanbertinat.papeleriagest.web.dto.CursoResponse;
import dev.alanbertinat.papeleriagest.web.dto.MateriaCursoDocenteResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cursos")
public class CursoController {

    private final CursoService cursoService;

    public CursoController(CursoService cursoService) {
        this.cursoService = cursoService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CursoResponse> crear(@Valid @RequestBody CursoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cursoService.crear(request));
    }

    @GetMapping
    public List<CursoResponse> listar() {
        return cursoService.listar();
    }

    @PostMapping("/{cursoId}/estudiantes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CursoEstudianteResponse> asignarEstudiante(
            @PathVariable Long cursoId, @Valid @RequestBody AsignarEstudianteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(cursoService.asignarEstudiante(cursoId, request));
    }

    @GetMapping("/{cursoId}/estudiantes")
    @PreAuthorize("hasRole('ADMIN')")
    public List<CursoEstudianteResponse> listarEstudiantes(@PathVariable Long cursoId) {
        return cursoService.listarEstudiantes(cursoId);
    }

    @PostMapping("/{cursoId}/docentes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MateriaCursoDocenteResponse> asignarDocente(
            @PathVariable Long cursoId, @Valid @RequestBody AsignarDocenteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cursoService.asignarDocente(cursoId, request));
    }

    @GetMapping("/docentes/{docenteId}/materias")
    public List<MateriaCursoDocenteResponse> listarMateriasPorDocente(@PathVariable Long docenteId) {
        return cursoService.listarMateriasPorDocente(docenteId);
    }
}
