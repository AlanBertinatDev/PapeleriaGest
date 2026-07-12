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
import dev.alanbertinat.papeleriagest.web.dto.CrearPedidoRequest;
import dev.alanbertinat.papeleriagest.web.dto.LoginRequest;
import dev.alanbertinat.papeleriagest.web.dto.PedidoItemRequest;
import dev.alanbertinat.papeleriagest.web.dto.PedidoResponse;
import dev.alanbertinat.papeleriagest.web.dto.ProductoMasVendidoResponse;
import dev.alanbertinat.papeleriagest.web.dto.RegisterRequest;
import dev.alanbertinat.papeleriagest.web.dto.UsuarioConteoResponse;
import dev.alanbertinat.papeleriagest.web.dto.UsuarioGastoResponse;
import java.math.BigDecimal;
import java.util.List;
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
import org.springframework.web.util.UriComponentsBuilder;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ReporteFlowTest extends AbstractIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private NivelRepository nivelRepository;

    @Autowired
    private CategoriaProductoRepository categoriaProductoRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String adminToken;
    private String clienteToken;
    private Long productoId;

    @BeforeAll
    void setUp() {
        Usuario admin = Usuario.builder()
                .nombre("Admin Reporte")
                .email("admin-reporte@example.com")
                .cedula("admin-reporte-cedula")
                .passwordHash(passwordEncoder.encode("adminpass123"))
                .activo(true)
                .reciveOfertas(false)
                .nivel(nivelRepository.findAll().stream().filter(n -> n.isAdmin()).findFirst().orElseThrow())
                .build();
        usuarioRepository.save(admin);
        adminToken = login("admin-reporte@example.com", "adminpass123");

        ResponseEntity<AuthResponse> clienteRegister = restTemplate.postForEntity(
                "/api/auth/register",
                new RegisterRequest("Cliente Reporte", "cliente-reporte@example.com", "cliente-reporte-cedula", null, "clientepass123"),
                AuthResponse.class);
        clienteToken = clienteRegister.getBody().token();

        CategoriaProducto categoria = categoriaProductoRepository.save(
                CategoriaProducto.builder().nombre("Papelería").porcentaje(22).activo(true).build());

        Producto producto = productoRepository.save(Producto.builder()
                .codigoProducto(3001L)
                .nombre("Lapicera")
                .precioVenta(new BigDecimal("50.00"))
                .precioCompra(new BigDecimal("30.00"))
                .fechaCarga(java.time.LocalDate.now())
                .activo(true)
                .categoria(categoria)
                .cantidad(100)
                .stockMinimo(10)
                .build());
        productoId = producto.getCodigoProducto();

        for (int i = 0; i < 3; i++) {
            CrearPedidoRequest crearRequest = new CrearPedidoRequest(
                    null, null, false, null, "Pedido reporte " + i, List.of(new PedidoItemRequest(productoId, null, 2)));
            ResponseEntity<PedidoResponse> created = restTemplate.exchange(
                    "/api/pedidos", HttpMethod.POST,
                    new HttpEntity<>(crearRequest, authHeaders(clienteToken)), PedidoResponse.class);
            assertThat(created.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        }
    }

    @Test
    void reportesReflectCreatedPedidos() {
        java.time.LocalDate desde = java.time.LocalDate.now().minusDays(1);
        java.time.LocalDate hasta = java.time.LocalDate.now().plusDays(1);

        String productosUrl = UriComponentsBuilder.fromPath("/api/reportes/productos-mas-vendidos")
                .queryParam("desde", desde).queryParam("hasta", hasta).toUriString();
        ResponseEntity<ProductoMasVendidoResponse[]> productos = restTemplate.exchange(
                productosUrl, HttpMethod.GET, new HttpEntity<>(authHeaders(adminToken)), ProductoMasVendidoResponse[].class);
        assertThat(productos.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(productos.getBody()).anySatisfy(p -> {
            assertThat(p.productoId()).isEqualTo(productoId);
            assertThat(p.cantidadVendida()).isEqualTo(6L);
        });

        String pedidosUrl = UriComponentsBuilder.fromPath("/api/reportes/usuarios-mas-pedidos")
                .queryParam("desde", desde).queryParam("hasta", hasta).toUriString();
        ResponseEntity<UsuarioConteoResponse[]> usuariosPedidos = restTemplate.exchange(
                pedidosUrl, HttpMethod.GET, new HttpEntity<>(authHeaders(adminToken)), UsuarioConteoResponse[].class);
        assertThat(usuariosPedidos.getBody()).anySatisfy(u -> assertThat(u.cantidad()).isEqualTo(3L));

        String gastoUrl = UriComponentsBuilder.fromPath("/api/reportes/usuarios-mas-gasto")
                .queryParam("desde", desde).queryParam("hasta", hasta).toUriString();
        ResponseEntity<UsuarioGastoResponse[]> usuariosGasto = restTemplate.exchange(
                gastoUrl, HttpMethod.GET, new HttpEntity<>(authHeaders(adminToken)), UsuarioGastoResponse[].class);
        assertThat(usuariosGasto.getBody()).anySatisfy(
                u -> assertThat(u.totalGastado()).isEqualByComparingTo("300.00"));

        ResponseEntity<String> forbidden = restTemplate.exchange(
                productosUrl, HttpMethod.GET, new HttpEntity<>(authHeaders(clienteToken)), String.class);
        assertThat(forbidden.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    private String login(String email, String password) {
        ResponseEntity<AuthResponse> response = restTemplate.postForEntity(
                "/api/auth/login", new LoginRequest(email, password), AuthResponse.class);
        return response.getBody().token();
    }

    private HttpHeaders authHeaders(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        return headers;
    }
}
