package dev.alanbertinat.papeleriagest;

import static org.assertj.core.api.Assertions.assertThat;

import dev.alanbertinat.papeleriagest.domain.CategoriaProducto;
import dev.alanbertinat.papeleriagest.domain.Marca;
import dev.alanbertinat.papeleriagest.domain.Usuario;
import dev.alanbertinat.papeleriagest.repository.CategoriaProductoRepository;
import dev.alanbertinat.papeleriagest.repository.MarcaRepository;
import dev.alanbertinat.papeleriagest.repository.NivelRepository;
import dev.alanbertinat.papeleriagest.repository.UsuarioRepository;
import dev.alanbertinat.papeleriagest.web.dto.AuthResponse;
import dev.alanbertinat.papeleriagest.web.dto.LoginRequest;
import dev.alanbertinat.papeleriagest.web.dto.ProductoRequest;
import dev.alanbertinat.papeleriagest.web.dto.ProductoResponse;
import dev.alanbertinat.papeleriagest.web.dto.RegisterRequest;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
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

class CatalogFlowTest extends AbstractIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private NivelRepository nivelRepository;

    @Autowired
    private CategoriaProductoRepository categoriaProductoRepository;

    @Autowired
    private MarcaRepository marcaRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String adminToken;
    private String estandarToken;
    private Long categoriaId;
    private Long marcaId;

    @BeforeEach
    void setUp() {
        Usuario admin = Usuario.builder()
                .nombre("Admin Test")
                .email("admin@example.com")
                .cedula("admin-cedula")
                .passwordHash(passwordEncoder.encode("adminpass123"))
                .activo(true)
                .reciveOfertas(false)
                .nivel(nivelRepository.findAll().stream().filter(n -> n.isAdmin()).findFirst().orElseThrow())
                .build();
        usuarioRepository.save(admin);

        ResponseEntity<AuthResponse> adminLogin = restTemplate.postForEntity(
                "/api/auth/login", new LoginRequest("admin@example.com", "adminpass123"), AuthResponse.class);
        adminToken = adminLogin.getBody().token();

        ResponseEntity<AuthResponse> estandarRegister = restTemplate.postForEntity(
                "/api/auth/register",
                new RegisterRequest("Cliente Test", "cliente@example.com", "cliente-cedula", null, "clientepass123"),
                AuthResponse.class);
        estandarToken = estandarRegister.getBody().token();

        CategoriaProducto categoria = categoriaProductoRepository.save(
                CategoriaProducto.builder().nombre("Papelería").porcentaje(22).activo(true).build());
        categoriaId = categoria.getId();

        Marca marca = marcaRepository.save(Marca.builder().nombre("Genérica").activo(true).build());
        marcaId = marca.getId();
    }

    @Test
    void adminCanManageProductsAndEstandarCannot() {
        ProductoRequest createRequest = new ProductoRequest(
                1001L, "Cuaderno A4", null, new BigDecimal("250.00"), new BigDecimal("150.00"),
                categoriaId, marcaId, 5, "unidad", "22%", 10);

        ResponseEntity<String> forbidden = restTemplate.exchange(
                "/api/productos", HttpMethod.POST,
                new HttpEntity<>(createRequest, authHeaders(estandarToken)), String.class);
        assertThat(forbidden.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);

        ResponseEntity<ProductoResponse> created = restTemplate.exchange(
                "/api/productos", HttpMethod.POST,
                new HttpEntity<>(createRequest, authHeaders(adminToken)), ProductoResponse.class);
        assertThat(created.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(created.getBody().stockBajo()).isTrue();
        assertThat(created.getBody().tieneImagen()).isFalse();

        MultiValueMap<String, Object> partesImagen = new LinkedMultiValueMap<>();
        ByteArrayResource imagen = new ByteArrayResource("contenido-imagen".getBytes(StandardCharsets.UTF_8)) {
            @Override
            public String getFilename() {
                return "foto.jpg";
            }
        };
        partesImagen.add("archivo", imagen);
        HttpHeaders imagenHeaders = authHeaders(adminToken);
        imagenHeaders.setContentType(MediaType.MULTIPART_FORM_DATA);
        ResponseEntity<ProductoResponse> conImagen = restTemplate.exchange(
                "/api/productos/1001/imagen", HttpMethod.POST,
                new HttpEntity<>(partesImagen, imagenHeaders), ProductoResponse.class);
        assertThat(conImagen.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(conImagen.getBody().tieneImagen()).isTrue();

        ResponseEntity<byte[]> imagenDescargada = restTemplate.exchange(
                "/api/productos/1001/imagen", HttpMethod.GET,
                new HttpEntity<>(authHeaders(estandarToken)), byte[].class);
        assertThat(imagenDescargada.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(imagenDescargada.getBody()).isEqualTo("contenido-imagen".getBytes(StandardCharsets.UTF_8));

        ResponseEntity<ProductoResponse[]> listAsEstandar = restTemplate.exchange(
                "/api/productos", HttpMethod.GET,
                new HttpEntity<>(authHeaders(estandarToken)), ProductoResponse[].class);
        assertThat(listAsEstandar.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(listAsEstandar.getBody()).extracting(ProductoResponse::codigoProducto).contains(1001L);

        ProductoRequest updateRequest = new ProductoRequest(
                1001L, "Cuaderno A4 Tapa Dura", null, new BigDecimal("300.00"), new BigDecimal("180.00"),
                categoriaId, marcaId, 20, "unidad", "22%", 10);
        ResponseEntity<ProductoResponse> updated = restTemplate.exchange(
                "/api/productos/1001", HttpMethod.PUT,
                new HttpEntity<>(updateRequest, authHeaders(adminToken)), ProductoResponse.class);
        assertThat(updated.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(updated.getBody().stockBajo()).isFalse();

        ResponseEntity<String> reponerForbidden = restTemplate.exchange(
                "/api/productos/1001/reponer-stock", HttpMethod.PUT,
                new HttpEntity<>(new dev.alanbertinat.papeleriagest.web.dto.ReponerStockRequest(5), authHeaders(estandarToken)),
                String.class);
        assertThat(reponerForbidden.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);

        ResponseEntity<ProductoResponse> repuesto = restTemplate.exchange(
                "/api/productos/1001/reponer-stock", HttpMethod.PUT,
                new HttpEntity<>(new dev.alanbertinat.papeleriagest.web.dto.ReponerStockRequest(5), authHeaders(adminToken)),
                ProductoResponse.class);
        assertThat(repuesto.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(repuesto.getBody().cantidad()).isEqualTo(25);

        ResponseEntity<Void> deleteForbidden = restTemplate.exchange(
                "/api/productos/1001", HttpMethod.DELETE,
                new HttpEntity<>(authHeaders(estandarToken)), Void.class);
        assertThat(deleteForbidden.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);

        ResponseEntity<Void> deleted = restTemplate.exchange(
                "/api/productos/1001", HttpMethod.DELETE,
                new HttpEntity<>(authHeaders(adminToken)), Void.class);
        assertThat(deleted.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

        ResponseEntity<ProductoResponse[]> listAfterDelete = restTemplate.exchange(
                "/api/productos", HttpMethod.GET,
                new HttpEntity<>(authHeaders(adminToken)), ProductoResponse[].class);
        assertThat(listAfterDelete.getBody()).extracting(ProductoResponse::codigoProducto).doesNotContain(1001L);

        ResponseEntity<ProductoResponse[]> inactivos = restTemplate.exchange(
                "/api/productos/inactivos", HttpMethod.GET,
                new HttpEntity<>(authHeaders(adminToken)), ProductoResponse[].class);
        assertThat(inactivos.getBody()).extracting(ProductoResponse::codigoProducto).contains(1001L);

        ResponseEntity<ProductoResponse> reactivado = restTemplate.exchange(
                "/api/productos/1001/reactivar", HttpMethod.PUT,
                new HttpEntity<>(authHeaders(adminToken)), ProductoResponse.class);
        assertThat(reactivado.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(reactivado.getBody().activo()).isTrue();

        ResponseEntity<ProductoResponse[]> listAfterReactivar = restTemplate.exchange(
                "/api/productos", HttpMethod.GET,
                new HttpEntity<>(authHeaders(adminToken)), ProductoResponse[].class);
        assertThat(listAfterReactivar.getBody()).extracting(ProductoResponse::codigoProducto).contains(1001L);
    }

    private HttpHeaders authHeaders(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        return headers;
    }
}
