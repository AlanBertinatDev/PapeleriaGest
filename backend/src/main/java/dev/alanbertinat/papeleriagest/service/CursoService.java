package dev.alanbertinat.papeleriagest.service;

import dev.alanbertinat.papeleriagest.domain.Curso;
import dev.alanbertinat.papeleriagest.domain.CursoEstudiante;
import dev.alanbertinat.papeleriagest.domain.MateriaCursoDocente;
import dev.alanbertinat.papeleriagest.domain.Usuario;
import dev.alanbertinat.papeleriagest.exception.ConflictException;
import dev.alanbertinat.papeleriagest.exception.ResourceNotFoundException;
import dev.alanbertinat.papeleriagest.repository.CursoEstudianteRepository;
import dev.alanbertinat.papeleriagest.repository.CursoRepository;
import dev.alanbertinat.papeleriagest.repository.MateriaCursoDocenteRepository;
import dev.alanbertinat.papeleriagest.repository.UsuarioRepository;
import dev.alanbertinat.papeleriagest.web.dto.AsignarDocenteRequest;
import dev.alanbertinat.papeleriagest.web.dto.AsignarEstudianteRequest;
import dev.alanbertinat.papeleriagest.web.dto.CursoEstudianteResponse;
import dev.alanbertinat.papeleriagest.web.dto.CursoRequest;
import dev.alanbertinat.papeleriagest.web.dto.CursoResponse;
import dev.alanbertinat.papeleriagest.web.dto.MateriaCursoDocenteResponse;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CursoService {

    private final CursoRepository cursoRepository;
    private final CursoEstudianteRepository cursoEstudianteRepository;
    private final MateriaCursoDocenteRepository materiaCursoDocenteRepository;
    private final UsuarioRepository usuarioRepository;

    public CursoService(
            CursoRepository cursoRepository,
            CursoEstudianteRepository cursoEstudianteRepository,
            MateriaCursoDocenteRepository materiaCursoDocenteRepository,
            UsuarioRepository usuarioRepository) {
        this.cursoRepository = cursoRepository;
        this.cursoEstudianteRepository = cursoEstudianteRepository;
        this.materiaCursoDocenteRepository = materiaCursoDocenteRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public CursoResponse crear(CursoRequest request) {
        Curso curso = Curso.builder().grado(request.grado()).grupo(request.grupo()).build();
        return CursoResponse.from(cursoRepository.save(curso));
    }

    @Transactional(readOnly = true)
    public List<CursoResponse> listar() {
        return cursoRepository.findAll().stream().map(CursoResponse::from).toList();
    }

    @Transactional
    public CursoEstudianteResponse asignarEstudiante(Long cursoId, AsignarEstudianteRequest request) {
        Curso curso = buscarCurso(cursoId);
        Usuario estudiante = buscarUsuario(request.estudianteId());
        if (cursoEstudianteRepository.existsByCursoIdAndEstudianteId(cursoId, estudiante.getId())) {
            throw new ConflictException("El estudiante ya está asignado a este curso");
        }
        CursoEstudiante asignacion =
                CursoEstudiante.builder().curso(curso).estudiante(estudiante).build();
        return CursoEstudianteResponse.from(cursoEstudianteRepository.save(asignacion));
    }

    @Transactional(readOnly = true)
    public List<CursoEstudianteResponse> listarEstudiantes(Long cursoId) {
        return cursoEstudianteRepository.findByCursoId(cursoId).stream()
                .map(CursoEstudianteResponse::from)
                .toList();
    }

    @Transactional
    public MateriaCursoDocenteResponse asignarDocente(Long cursoId, AsignarDocenteRequest request) {
        Curso curso = buscarCurso(cursoId);
        Usuario docente = buscarUsuario(request.docenteId());
        if (materiaCursoDocenteRepository.existsByCursoIdAndDocenteIdAndMateria(
                cursoId, docente.getId(), request.materia())) {
            throw new ConflictException("El docente ya tiene asignada esa materia en este curso");
        }
        MateriaCursoDocente asignacion = MateriaCursoDocente.builder()
                .curso(curso)
                .docente(docente)
                .materia(request.materia())
                .build();
        return MateriaCursoDocenteResponse.from(materiaCursoDocenteRepository.save(asignacion));
    }

    @Transactional(readOnly = true)
    public List<MateriaCursoDocenteResponse> listarMateriasPorDocente(Long docenteId) {
        return materiaCursoDocenteRepository.findByDocenteId(docenteId).stream()
                .map(MateriaCursoDocenteResponse::from)
                .toList();
    }

    private Curso buscarCurso(Long id) {
        return cursoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado: " + id));
    }

    private Usuario buscarUsuario(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + id));
    }
}
