package dev.alanbertinat.papeleriagest;

import static org.assertj.core.api.Assertions.assertThat;

import dev.alanbertinat.papeleriagest.domain.Nivel;
import dev.alanbertinat.papeleriagest.domain.Usuario;
import dev.alanbertinat.papeleriagest.repository.NivelRepository;
import dev.alanbertinat.papeleriagest.repository.UsuarioRepository;
import dev.alanbertinat.papeleriagest.web.dto.AuthResponse;
import dev.alanbertinat.papeleriagest.web.dto.CambiarNivelRequest;
import dev.alanbertinat.papeleriagest.web.dto.LoginRequest;
import dev.alanbertinat.papeleriagest.web.dto.NivelResponse;
import dev.alanbertinat.papeleriagest.web.dto.RegisterRequest;
import dev.alanbertinat.papeleriagest.web.dto.UsuarioResponse;
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
class UsuarioAdminFlowTest extends AbstractIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private NivelRepository nivelRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String adminToken;
    private Long adminId;
    private String estandarToken;
    private Long estandarId;
    private Long nivelEstandarId;
    private Long nivelAdminId;

    @BeforeAll
    void setUp() {
        Nivel nivelAdmin = nivelRepository.findAll().stream().filter(Nivel::isAdmin).findFirst().orElseThrow();
        nivelAdminId = nivelAdmin.getId();
        Nivel nivelEstandar = nivelRepository.findAll().stream().filter(Nivel::isEstandar).findFirst().orElseThrow();
        nivelEstandarId = nivelEstandar.getId();

        Usuario admin = Usuario.builder()
                .nombre("Admin Usuarios")
                .email("admin-usuarios@example.com")
                .cedula("admin-usuarios-cedula")
                .passwordHash(passwordEncoder.encode("adminpass123"))
                .activo(true)
                .reciveOfertas(false)
                .nivel(nivelAdmin)
                .build();
        admin = usuarioRepository.save(admin);
        adminId = admin.getId();
        adminToken = login("admin-usuarios@example.com", "adminpass123");

        estandarToken = register("Cliente Usuarios", "cliente-usuarios@example.com", "cliente-usuarios-cedula", "clientepass123");
        estandarId = usuarioRepository.findByEmailAndActivoTrue("cliente-usuarios@example.com").orElseThrow().getId();
    }

    @Test
    void estandarNoPuedeAccederAGestionDeUsuarios() {
        ResponseEntity<String> forbidden = restTemplate.exchange(
                "/api/usuarios", HttpMethod.GET,
                new HttpEntity<>(authHeaders(estandarToken)), String.class);
        assertThat(forbidden.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void adminPuedeListarUsuariosYNiveles() {
        ResponseEntity<UsuarioResponse[]> usuarios = restTemplate.exchange(
                "/api/usuarios", HttpMethod.GET,
                new HttpEntity<>(authHeaders(adminToken)), UsuarioResponse[].class);
        assertThat(usuarios.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(usuarios.getBody()).extracting(UsuarioResponse::id).contains(adminId, estandarId);

        ResponseEntity<NivelResponse[]> niveles = restTemplate.exchange(
                "/api/usuarios/niveles", HttpMethod.GET,
                new HttpEntity<>(authHeaders(adminToken)), NivelResponse[].class);
        assertThat(niveles.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(niveles.getBody()).isNotEmpty();
    }

    @Test
    void adminPuedeCambiarRolDeOtroUsuario() {
        register("Cambio Rol", "cambio-rol@example.com", "cambio-rol-cedula", "clientepass123");
        Long otroId = usuarioRepository.findByEmailAndActivoTrue("cambio-rol@example.com").orElseThrow().getId();

        ResponseEntity<UsuarioResponse> cambiado = restTemplate.exchange(
                "/api/usuarios/" + otroId + "/nivel", HttpMethod.PUT,
                new HttpEntity<>(new CambiarNivelRequest(nivelAdminId), authHeaders(adminToken)),
                UsuarioResponse.class);
        assertThat(cambiado.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(cambiado.getBody().nivel()).isEqualTo("Administrador");
    }

    @Test
    void adminNoPuedeCambiarSuPropioRol() {
        ResponseEntity<String> rechazado = restTemplate.exchange(
                "/api/usuarios/" + adminId + "/nivel", HttpMethod.PUT,
                new HttpEntity<>(new CambiarNivelRequest(nivelEstandarId), authHeaders(adminToken)), String.class);
        assertThat(rechazado.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void adminNoPuedeActivarODesactivarSuPropiaCuenta() {
        ResponseEntity<String> rechazado = restTemplate.exchange(
                "/api/usuarios/" + adminId + "/desactivar", HttpMethod.PUT,
                new HttpEntity<>(authHeaders(adminToken)), String.class);
        assertThat(rechazado.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void adminPuedeDesactivarYReactivarAOtroUsuario() {
        ResponseEntity<UsuarioResponse> desactivado = restTemplate.exchange(
                "/api/usuarios/" + estandarId + "/desactivar", HttpMethod.PUT,
                new HttpEntity<>(authHeaders(adminToken)), UsuarioResponse.class);
        assertThat(desactivado.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(desactivado.getBody().activo()).isFalse();

        ResponseEntity<UsuarioResponse> reactivado = restTemplate.exchange(
                "/api/usuarios/" + estandarId + "/activar", HttpMethod.PUT,
                new HttpEntity<>(authHeaders(adminToken)), UsuarioResponse.class);
        assertThat(reactivado.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(reactivado.getBody().activo()).isTrue();
    }

    private String login(String email, String password) {
        ResponseEntity<AuthResponse> response = restTemplate.postForEntity(
                "/api/auth/login", new LoginRequest(email, password), AuthResponse.class);
        return response.getBody().token();
    }

    private String register(String nombre, String email, String cedula, String password) {
        ResponseEntity<AuthResponse> response = restTemplate.postForEntity(
                "/api/auth/register", new RegisterRequest(nombre, email, cedula, null, password), AuthResponse.class);
        return response.getBody().token();
    }

    private HttpHeaders authHeaders(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        return headers;
    }
}
