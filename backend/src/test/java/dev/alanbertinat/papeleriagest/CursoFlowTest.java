package dev.alanbertinat.papeleriagest;

import static org.assertj.core.api.Assertions.assertThat;

import dev.alanbertinat.papeleriagest.domain.Usuario;
import dev.alanbertinat.papeleriagest.repository.NivelRepository;
import dev.alanbertinat.papeleriagest.repository.UsuarioRepository;
import dev.alanbertinat.papeleriagest.web.dto.AsignarDocenteRequest;
import dev.alanbertinat.papeleriagest.web.dto.AsignarEstudianteRequest;
import dev.alanbertinat.papeleriagest.web.dto.AuthResponse;
import dev.alanbertinat.papeleriagest.web.dto.CursoEstudianteResponse;
import dev.alanbertinat.papeleriagest.web.dto.CursoRequest;
import dev.alanbertinat.papeleriagest.web.dto.CursoResponse;
import dev.alanbertinat.papeleriagest.web.dto.LoginRequest;
import dev.alanbertinat.papeleriagest.web.dto.MateriaCursoDocenteResponse;
import dev.alanbertinat.papeleriagest.web.dto.RegisterRequest;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class CursoFlowTest extends AbstractIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private NivelRepository nivelRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String adminToken;
    private String estudianteToken;
    private Long estudianteId;
    private String docenteToken;
    private Long docenteId;

    @BeforeAll
    void setUp() {
        Usuario admin = Usuario.builder()
                .nombre("Admin Curso")
                .email("admin-curso@example.com")
                .cedula("admin-curso-cedula")
                .passwordHash(passwordEncoder.encode("adminpass123"))
                .activo(true)
                .reciveOfertas(false)
                .nivel(nivelRepository.findAll().stream().filter(n -> n.isAdmin()).findFirst().orElseThrow())
                .build();
        usuarioRepository.save(admin);
        adminToken = login("admin-curso@example.com", "adminpass123");

        ResponseEntity<AuthResponse> estudianteRegister = register(
                "Estudiante Curso", "estudiante-curso@example.com", "estudiante-curso-cedula", "estupass123");
        estudianteToken = estudianteRegister.getBody().token();
        estudianteId = estudianteRegister.getBody().usuario().id();

        ResponseEntity<AuthResponse> docenteRegister =
                register("Docente Curso", "docente-curso@example.com", "docente-curso-cedula", "docentepass123");
        docenteToken = docenteRegister.getBody().token();
        docenteId = docenteRegister.getBody().usuario().id();
    }

    @Test
    void adminManagesCursoAndAssignments() {
        ResponseEntity<String> forbidden = restTemplate.exchange(
                "/api/cursos", HttpMethod.POST,
                new HttpEntity<>(new CursoRequest("5to", "A"), authHeaders(estudianteToken)), String.class);
        assertThat(forbidden.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);

        ResponseEntity<CursoResponse> created = restTemplate.exchange(
                "/api/cursos", HttpMethod.POST,
                new HttpEntity<>(new CursoRequest("5to", "A"), authHeaders(adminToken)), CursoResponse.class);
        assertThat(created.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        Long cursoId = created.getBody().id();

        ResponseEntity<CursoResponse[]> listado = restTemplate.exchange(
                "/api/cursos", HttpMethod.GET,
                new HttpEntity<>(authHeaders(adminToken)), CursoResponse[].class);
        assertThat(listado.getBody()).extracting(CursoResponse::id).contains(cursoId);

        ResponseEntity<CursoEstudianteResponse> asignado = restTemplate.exchange(
                "/api/cursos/" + cursoId + "/estudiantes", HttpMethod.POST,
                new HttpEntity<>(new AsignarEstudianteRequest(estudianteId), authHeaders(adminToken)),
                CursoEstudianteResponse.class);
        assertThat(asignado.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        ResponseEntity<String> duplicado = restTemplate.exchange(
                "/api/cursos/" + cursoId + "/estudiantes", HttpMethod.POST,
                new HttpEntity<>(new AsignarEstudianteRequest(estudianteId), authHeaders(adminToken)), String.class);
        assertThat(duplicado.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);

        ResponseEntity<CursoEstudianteResponse[]> estudiantes = restTemplate.exchange(
                "/api/cursos/" + cursoId + "/estudiantes", HttpMethod.GET,
                new HttpEntity<>(authHeaders(adminToken)), CursoEstudianteResponse[].class);
        assertThat(estudiantes.getBody()).extracting(CursoEstudianteResponse::estudianteId).contains(estudianteId);

        ResponseEntity<MateriaCursoDocenteResponse> docenteAsignado = restTemplate.exchange(
                "/api/cursos/" + cursoId + "/docentes", HttpMethod.POST,
                new HttpEntity<>(new AsignarDocenteRequest(docenteId, "Matemática"), authHeaders(adminToken)),
                MateriaCursoDocenteResponse.class);
        assertThat(docenteAsignado.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        ResponseEntity<MateriaCursoDocenteResponse[]> materias = restTemplate.exchange(
                "/api/cursos/docentes/" + docenteId + "/materias", HttpMethod.GET,
                new HttpEntity<>(authHeaders(adminToken)), MateriaCursoDocenteResponse[].class);
        assertThat(materias.getBody()).extracting(MateriaCursoDocenteResponse::materia).contains("Matemática");
    }

    private String login(String email, String password) {
        ResponseEntity<AuthResponse> response = restTemplate.postForEntity(
                "/api/auth/login", new LoginRequest(email, password), AuthResponse.class);
        return response.getBody().token();
    }

    private ResponseEntity<AuthResponse> register(String nombre, String email, String cedula, String password) {
        return restTemplate.postForEntity(
                "/api/auth/register", new RegisterRequest(nombre, email, cedula, null, password), AuthResponse.class);
    }

    private HttpHeaders authHeaders(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        return headers;
    }
}
