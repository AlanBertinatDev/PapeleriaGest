package dev.alanbertinat.papeleriagest;

import static org.assertj.core.api.Assertions.assertThat;

import dev.alanbertinat.papeleriagest.domain.CategoriaProducto;
import dev.alanbertinat.papeleriagest.domain.Producto;
import dev.alanbertinat.papeleriagest.domain.Usuario;
import dev.alanbertinat.papeleriagest.repository.CategoriaProductoRepository;
import dev.alanbertinat.papeleriagest.repository.NivelRepository;
import dev.alanbertinat.papeleriagest.repository.ProductoRepository;
import dev.alanbertinat.papeleriagest.repository.UsuarioRepository;
import dev.alanbertinat.papeleriagest.web.dto.AuthResponse;
import dev.alanbertinat.papeleriagest.web.dto.LoginRequest;
import dev.alanbertinat.papeleriagest.web.dto.OfertaRequest;
import dev.alanbertinat.papeleriagest.web.dto.OfertaResponse;
import dev.alanbertinat.papeleriagest.web.dto.RegisterRequest;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

class OfertaFlowTest extends AbstractIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private NivelRepository nivelRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CategoriaProductoRepository categoriaProductoRepository;

    @Autowired
    private ProductoRepository productoRepository;

    private String adminToken;
    private String estandarToken;
    private Long productoId;

    @BeforeEach
    void setUp() {
        Usuario admin = Usuario.builder()
                .nombre("Admin Oferta")
                .email("admin-oferta@example.com")
                .cedula("admin-oferta-cedula")
                .passwordHash(passwordEncoder.encode("adminpass123"))
                .activo(true)
                .reciveOfertas(false)
                .nivel(nivelRepository.findAll().stream().filter(n -> n.isAdmin()).findFirst().orElseThrow())
                .build();
        usuarioRepository.save(admin);
        adminToken = login("admin-oferta@example.com", "adminpass123");

        estandarToken = register("Cliente Oferta", "cliente-oferta@example.com", "cliente-oferta-cedula", "clientepass123");

        CategoriaProducto categoria = categoriaProductoRepository.save(
                CategoriaProducto.builder().nombre("Papelería Oferta").porcentaje(22).activo(true).build());
        Producto producto = productoRepository.save(Producto.builder()
                .codigoProducto(3001L)
                .nombre("Cuaderno")
                .precioVenta(new BigDecimal("120.00"))
                .precioCompra(new BigDecimal("80.00"))
                .fechaCarga(LocalDate.now())
                .activo(true)
                .categoria(categoria)
                .cantidad(50)
                .stockMinimo(5)
                .build());
        productoId = producto.getCodigoProducto();
    }

    @Test
    void adminCreatesOfertaAndEstandarSeesOnlyVigentes() {
        OfertaRequest vigente = new OfertaRequest(
                "Descuento cuadernos", "20% en cuadernos", new BigDecimal("100.00"),
                LocalDate.now().minusDays(1), LocalDate.now().plusDays(5), List.of("https://img/oferta1.png"),
                List.of(productoId));
        OfertaRequest vencida = new OfertaRequest(
                "Oferta vieja", "ya vencida", new BigDecimal("50.00"),
                LocalDate.now().minusDays(10), LocalDate.now().minusDays(1), List.of(), List.of(productoId));

        ResponseEntity<String> forbidden = restTemplate.exchange(
                "/api/ofertas", HttpMethod.POST,
                new HttpEntity<>(vigente, authHeaders(estandarToken)), String.class);
        assertThat(forbidden.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);

        ResponseEntity<OfertaResponse> created = restTemplate.exchange(
                "/api/ofertas", HttpMethod.POST,
                new HttpEntity<>(vigente, authHeaders(adminToken)), OfertaResponse.class);
        assertThat(created.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(created.getBody().imagenesUrls()).containsExactly("https://img/oferta1.png");
        assertThat(created.getBody().productos())
                .extracting(dev.alanbertinat.papeleriagest.web.dto.ProductoResponse::codigoProducto)
                .containsExactly(productoId);
        Long vigenteId = created.getBody().id();

        ResponseEntity<OfertaResponse> createdVencida = restTemplate.exchange(
                "/api/ofertas", HttpMethod.POST,
                new HttpEntity<>(vencida, authHeaders(adminToken)), OfertaResponse.class);
        assertThat(createdVencida.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        ResponseEntity<OfertaResponse[]> vigentes = restTemplate.exchange(
                "/api/ofertas", HttpMethod.GET,
                new HttpEntity<>(authHeaders(estandarToken)), OfertaResponse[].class);
        assertThat(vigentes.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(vigentes.getBody()).extracting(OfertaResponse::id).containsExactly(vigenteId);

        ResponseEntity<String> todasForbidden = restTemplate.exchange(
                "/api/ofertas/todas", HttpMethod.GET,
                new HttpEntity<>(authHeaders(estandarToken)), String.class);
        assertThat(todasForbidden.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);

        ResponseEntity<OfertaResponse[]> todas = restTemplate.exchange(
                "/api/ofertas/todas", HttpMethod.GET,
                new HttpEntity<>(authHeaders(adminToken)), OfertaResponse[].class);
        assertThat(todas.getBody()).hasSize(2);

        ResponseEntity<Void> deleted = restTemplate.exchange(
                "/api/ofertas/" + vigenteId, HttpMethod.DELETE,
                new HttpEntity<>(authHeaders(adminToken)), Void.class);
        assertThat(deleted.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

        ResponseEntity<OfertaResponse[]> vigentesDespues = restTemplate.exchange(
                "/api/ofertas", HttpMethod.GET,
                new HttpEntity<>(authHeaders(estandarToken)), OfertaResponse[].class);
        assertThat(vigentesDespues.getBody()).isEmpty();
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
