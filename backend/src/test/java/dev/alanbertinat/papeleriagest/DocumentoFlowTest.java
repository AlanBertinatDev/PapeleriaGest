package dev.alanbertinat.papeleriagest;

import static org.assertj.core.api.Assertions.assertThat;

import dev.alanbertinat.papeleriagest.domain.Curso;
import dev.alanbertinat.papeleriagest.domain.EstadoDocumento;
import dev.alanbertinat.papeleriagest.domain.Usuario;
import dev.alanbertinat.papeleriagest.repository.CursoRepository;
import dev.alanbertinat.papeleriagest.repository.NivelRepository;
import dev.alanbertinat.papeleriagest.repository.UsuarioRepository;
import dev.alanbertinat.papeleriagest.web.dto.AuthResponse;
import dev.alanbertinat.papeleriagest.web.dto.CambiarEstadoDocumentoRequest;
import dev.alanbertinat.papeleriagest.web.dto.ConfiguracionRequest;
import dev.alanbertinat.papeleriagest.web.dto.ConfiguracionResponse;
import dev.alanbertinat.papeleriagest.web.dto.DocumentoResponse;
import dev.alanbertinat.papeleriagest.web.dto.LoginRequest;
import dev.alanbertinat.papeleriagest.web.dto.NotificacionResponse;
import dev.alanbertinat.papeleriagest.web.dto.RegisterRequest;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class DocumentoFlowTest extends AbstractIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private NivelRepository nivelRepository;

    @Autowired
    private CursoRepository cursoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String adminToken;
    private String ownerToken;
    private String otherToken;

    @BeforeAll
    void setUp() {
        Usuario admin = Usuario.builder()
                .nombre("Admin Documento")
                .email("admin-documento@example.com")
                .cedula("admin-documento-cedula")
                .passwordHash(passwordEncoder.encode("adminpass123"))
                .activo(true)
                .reciveOfertas(false)
                .nivel(nivelRepository.findAll().stream().filter(n -> n.isAdmin()).findFirst().orElseThrow())
                .build();
        usuarioRepository.save(admin);
        adminToken = login("admin-documento@example.com", "adminpass123");

        ownerToken = register("Owner Documento", "owner-documento@example.com", "owner-documento-cedula", "ownerpass123");
        otherToken = register("Other Documento", "other-documento@example.com", "other-documento-cedula", "otherpass123");
    }

    @Test
    void ownerUploadsDocumentAdminManagesItAndNotificationIsRecorded() {
        DocumentoResponse created = subirDocumento(ownerToken, "Apunte matemática", null).getBody();
        Long documentoId = created.id();
        assertThat(created.estado()).isEqualTo("PENDIENTE");
        assertThat(created.nombreArchivoOriginal()).isEqualTo("apunte.pdf");

        ResponseEntity<String> forbiddenAccess = restTemplate.exchange(
                "/api/documentos/" + documentoId, HttpMethod.GET,
                new HttpEntity<>(authHeaders(otherToken)), String.class);
        assertThat(forbiddenAccess.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);

        ResponseEntity<byte[]> descargaPropietario = restTemplate.exchange(
                "/api/documentos/" + documentoId + "/archivo", HttpMethod.GET,
                new HttpEntity<>(authHeaders(ownerToken)), byte[].class);
        assertThat(descargaPropietario.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(descargaPropietario.getBody()).isEqualTo("contenido de prueba".getBytes(StandardCharsets.UTF_8));

        ResponseEntity<String> descargaAjena = restTemplate.exchange(
                "/api/documentos/" + documentoId + "/archivo", HttpMethod.GET,
                new HttpEntity<>(authHeaders(otherToken)), String.class);
        assertThat(descargaAjena.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);

        ResponseEntity<DocumentoResponse[]> propios = restTemplate.exchange(
                "/api/documentos/mios", HttpMethod.GET,
                new HttpEntity<>(authHeaders(ownerToken)), DocumentoResponse[].class);
        assertThat(propios.getBody()).extracting(DocumentoResponse::id).contains(documentoId);

        ResponseEntity<String> listarTodosForbidden = restTemplate.exchange(
                "/api/documentos", HttpMethod.GET,
                new HttpEntity<>(authHeaders(ownerToken)), String.class);
        assertThat(listarTodosForbidden.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);

        ResponseEntity<DocumentoResponse[]> todos = restTemplate.exchange(
                "/api/documentos", HttpMethod.GET,
                new HttpEntity<>(authHeaders(adminToken)), DocumentoResponse[].class);
        assertThat(todos.getBody()).extracting(DocumentoResponse::id).contains(documentoId);

        ResponseEntity<DocumentoResponse> impreso = restTemplate.exchange(
                "/api/documentos/" + documentoId + "/estado", HttpMethod.PUT,
                new HttpEntity<>(new CambiarEstadoDocumentoRequest(EstadoDocumento.IMPRESO), authHeaders(adminToken)),
                DocumentoResponse.class);
        assertThat(impreso.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(impreso.getBody().estado()).isEqualTo("IMPRESO");

        ResponseEntity<NotificacionResponse[]> notificaciones = restTemplate.exchange(
                "/api/notificaciones", HttpMethod.GET,
                new HttpEntity<>(authHeaders(adminToken)), NotificacionResponse[].class);
        assertThat(notificaciones.getBody())
                .extracting(NotificacionResponse::documentoId)
                .contains(documentoId);

        NotificacionResponse notificacionDelDocumento = java.util.Arrays.stream(notificaciones.getBody())
                .filter(n -> documentoId.equals(n.documentoId()))
                .findFirst()
                .orElseThrow();
        assertThat(notificacionDelDocumento.leida()).isFalse();

        ResponseEntity<NotificacionResponse[]> noLeidasAntes = restTemplate.exchange(
                "/api/notificaciones/no-leidas", HttpMethod.GET,
                new HttpEntity<>(authHeaders(adminToken)), NotificacionResponse[].class);
        assertThat(noLeidasAntes.getBody()).extracting(NotificacionResponse::id).contains(notificacionDelDocumento.id());

        ResponseEntity<Void> marcarLeida = restTemplate.exchange(
                "/api/notificaciones/" + notificacionDelDocumento.id() + "/leida", HttpMethod.PUT,
                new HttpEntity<>(authHeaders(adminToken)), Void.class);
        assertThat(marcarLeida.getStatusCode()).isEqualTo(HttpStatus.OK);

        ResponseEntity<NotificacionResponse[]> noLeidasDespues = restTemplate.exchange(
                "/api/notificaciones/no-leidas", HttpMethod.GET,
                new HttpEntity<>(authHeaders(adminToken)), NotificacionResponse[].class);
        assertThat(noLeidasDespues.getBody())
                .extracting(NotificacionResponse::id)
                .doesNotContain(notificacionDelDocumento.id());

        ResponseEntity<Void> deleteForbidden = restTemplate.exchange(
                "/api/documentos/" + documentoId, HttpMethod.DELETE,
                new HttpEntity<>(authHeaders(otherToken)), Void.class);
        assertThat(deleteForbidden.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);

        ResponseEntity<Void> deleted = restTemplate.exchange(
                "/api/documentos/" + documentoId, HttpMethod.DELETE,
                new HttpEntity<>(authHeaders(ownerToken)), Void.class);
        assertThat(deleted.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
    }

    @Test
    void materialDeCursoEsDescargablePorCualquierUsuarioAutenticado() {
        Curso curso = cursoRepository.save(Curso.builder().grado("5to").grupo("B").build());

        DocumentoResponse creado = subirDocumento(ownerToken, "Guía de curso", curso.getId()).getBody();

        ResponseEntity<byte[]> descargaOtroUsuario = restTemplate.exchange(
                "/api/documentos/" + creado.id() + "/archivo", HttpMethod.GET,
                new HttpEntity<>(authHeaders(otherToken)), byte[].class);
        assertThat(descargaOtroUsuario.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void adminManagesConfiguracion() {
        ResponseEntity<String> forbidden = restTemplate.exchange(
                "/api/configuraciones", HttpMethod.PUT,
                new HttpEntity<>(new ConfiguracionRequest("CorreoEmpresa", "contacto@papeleria.com"),
                        authHeaders(ownerToken)),
                String.class);
        assertThat(forbidden.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);

        ResponseEntity<ConfiguracionResponse> upserted = restTemplate.exchange(
                "/api/configuraciones", HttpMethod.PUT,
                new HttpEntity<>(new ConfiguracionRequest("CorreoEmpresa", "contacto@papeleria.com"),
                        authHeaders(adminToken)),
                ConfiguracionResponse.class);
        assertThat(upserted.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(upserted.getBody().valor()).isEqualTo("contacto@papeleria.com");

        ResponseEntity<ConfiguracionResponse> updated = restTemplate.exchange(
                "/api/configuraciones", HttpMethod.PUT,
                new HttpEntity<>(new ConfiguracionRequest("CorreoEmpresa", "nuevo@papeleria.com"),
                        authHeaders(adminToken)),
                ConfiguracionResponse.class);
        assertThat(updated.getBody().valor()).isEqualTo("nuevo@papeleria.com");
        assertThat(updated.getBody().id()).isEqualTo(upserted.getBody().id());

        ResponseEntity<ConfiguracionResponse[]> listado = restTemplate.exchange(
                "/api/configuraciones", HttpMethod.GET,
                new HttpEntity<>(authHeaders(adminToken)), ConfiguracionResponse[].class);
        assertThat(listado.getBody()).extracting(ConfiguracionResponse::nombre).contains("CorreoEmpresa");
    }

    @Test
    void parametroNumericoRechazaValoresNoNumericosONegativos() {
        ResponseEntity<String> noNumerico = restTemplate.exchange(
                "/api/configuraciones", HttpMethod.PUT,
                new HttpEntity<>(new ConfiguracionRequest("ImpresionGrapado", "12,50"), authHeaders(adminToken)),
                String.class);
        assertThat(noNumerico.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);

        ResponseEntity<String> negativo = restTemplate.exchange(
                "/api/configuraciones", HttpMethod.PUT,
                new HttpEntity<>(new ConfiguracionRequest("ImpresionGrapado", "-50"), authHeaders(adminToken)),
                String.class);
        assertThat(negativo.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);

        ResponseEntity<ConfiguracionResponse> valido = restTemplate.exchange(
                "/api/configuraciones", HttpMethod.PUT,
                new HttpEntity<>(new ConfiguracionRequest("ImpresionGrapado", "20.00"), authHeaders(adminToken)),
                ConfiguracionResponse.class);
        assertThat(valido.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    private ResponseEntity<DocumentoResponse> subirDocumento(String token, String nombre, Long cursoId) {
        MultiValueMap<String, Object> partes = new LinkedMultiValueMap<>();
        partes.add("nombre", nombre);
        partes.add("esDobleFaz", "true");
        partes.add("aColor", "false");
        partes.add("esEnvio", "false");
        partes.add("cantidadCopias", "1");
        partes.add("esPractico", "false");
        partes.add("nroPractico", "0");
        partes.add("esImagen", "false");
        partes.add("esPropio", "false");
        if (cursoId != null) {
            partes.add("cursoId", cursoId.toString());
        }
        ByteArrayResource archivo = new ByteArrayResource("contenido de prueba".getBytes(StandardCharsets.UTF_8)) {
            @Override
            public String getFilename() {
                return "apunte.pdf";
            }
        };
        partes.add("archivo", archivo);

        HttpHeaders headers = authHeaders(token);
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        return restTemplate.exchange(
                "/api/documentos", HttpMethod.POST, new HttpEntity<>(partes, headers), DocumentoResponse.class);
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
