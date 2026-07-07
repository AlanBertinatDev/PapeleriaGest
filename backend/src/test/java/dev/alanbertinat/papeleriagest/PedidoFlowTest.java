package dev.alanbertinat.papeleriagest;

import static org.assertj.core.api.Assertions.assertThat;

import dev.alanbertinat.papeleriagest.domain.CategoriaProducto;
import dev.alanbertinat.papeleriagest.domain.Configuracion;
import dev.alanbertinat.papeleriagest.domain.Producto;
import dev.alanbertinat.papeleriagest.domain.Usuario;
import dev.alanbertinat.papeleriagest.repository.CategoriaProductoRepository;
import dev.alanbertinat.papeleriagest.repository.ConfiguracionRepository;
import dev.alanbertinat.papeleriagest.repository.NivelRepository;
import dev.alanbertinat.papeleriagest.repository.PedidoRepository;
import dev.alanbertinat.papeleriagest.repository.ProductoRepository;
import dev.alanbertinat.papeleriagest.repository.UsuarioRepository;
import dev.alanbertinat.papeleriagest.web.dto.AuthResponse;
import dev.alanbertinat.papeleriagest.web.dto.CambiarEstadoPedidoRequest;
import dev.alanbertinat.papeleriagest.web.dto.CrearPedidoRequest;
import dev.alanbertinat.papeleriagest.web.dto.LoginRequest;
import dev.alanbertinat.papeleriagest.web.dto.PedidoItemRequest;
import dev.alanbertinat.papeleriagest.web.dto.PedidoResponse;
import dev.alanbertinat.papeleriagest.web.dto.RegisterRequest;
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

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class PedidoFlowTest extends AbstractIntegrationTest {

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
    private PedidoRepository pedidoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ConfiguracionRepository configuracionRepository;

    private String adminToken;
    private String ownerToken;
    private String otherToken;
    private Long productoId;

    @BeforeAll
    void setUp() {
        Usuario admin = Usuario.builder()
                .nombre("Admin Test")
                .email("admin-pedido@example.com")
                .cedula("admin-pedido-cedula")
                .passwordHash(passwordEncoder.encode("adminpass123"))
                .activo(true)
                .reciveOfertas(false)
                .nivel(nivelRepository.findAll().stream().filter(n -> n.isAdmin()).findFirst().orElseThrow())
                .build();
        usuarioRepository.save(admin);
        adminToken = login("admin-pedido@example.com", "adminpass123");

        ownerToken = register("Owner Test", "owner@example.com", "owner-cedula", "ownerpass123");
        otherToken = register("Other Test", "other@example.com", "other-cedula", "otherpass123");

        CategoriaProducto categoria = categoriaProductoRepository.save(
                CategoriaProducto.builder().nombre("Papelería").porcentaje(22).activo(true).build());

        Producto producto = productoRepository.save(Producto.builder()
                .codigoProducto(2001L)
                .nombre("Resma A4")
                .precioVenta(new BigDecimal("500.00"))
                .precioCompra(new BigDecimal("300.00"))
                .fechaCarga(java.time.LocalDate.now())
                .activo(true)
                .categoria(categoria)
                .cantidad(100)
                .stockMinimo(10)
                .build());
        productoId = producto.getCodigoProducto();
    }

    @Test
    void ownerCanCreateAndCancelPedidoOthersCannotAccess() {
        CrearPedidoRequest crearRequest = new CrearPedidoRequest(
                null, null, false, null, "Pedido de prueba", List.of(new PedidoItemRequest(productoId, 3)));

        ResponseEntity<PedidoResponse> created = restTemplate.exchange(
                "/api/pedidos", HttpMethod.POST,
                new HttpEntity<>(crearRequest, authHeaders(ownerToken)), PedidoResponse.class);
        assertThat(created.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(created.getBody().precio()).isEqualByComparingTo("1500.00");
        assertThat(created.getBody().estado()).isEqualTo("PENDIENTE");
        Long pedidoId = created.getBody().id();

        ResponseEntity<String> forbiddenAccess = restTemplate.exchange(
                "/api/pedidos/" + pedidoId, HttpMethod.GET,
                new HttpEntity<>(authHeaders(otherToken)), String.class);
        assertThat(forbiddenAccess.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);

        ResponseEntity<PedidoResponse> adminAccess = restTemplate.exchange(
                "/api/pedidos/" + pedidoId, HttpMethod.GET,
                new HttpEntity<>(authHeaders(adminToken)), PedidoResponse.class);
        assertThat(adminAccess.getStatusCode()).isEqualTo(HttpStatus.OK);

        ResponseEntity<PedidoResponse[]> misPedidos = restTemplate.exchange(
                "/api/pedidos/mios", HttpMethod.GET,
                new HttpEntity<>(authHeaders(ownerToken)), PedidoResponse[].class);
        assertThat(misPedidos.getBody()).extracting(PedidoResponse::id).contains(pedidoId);

        ResponseEntity<String> forbiddenCancel = restTemplate.exchange(
                "/api/pedidos/" + pedidoId + "/cancelar", HttpMethod.PUT,
                new HttpEntity<>(authHeaders(otherToken)), String.class);
        assertThat(forbiddenCancel.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);

        ResponseEntity<PedidoResponse> cancelled = restTemplate.exchange(
                "/api/pedidos/" + pedidoId + "/cancelar", HttpMethod.PUT,
                new HttpEntity<>(authHeaders(ownerToken)), PedidoResponse.class);
        assertThat(cancelled.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(cancelled.getBody().estado()).isEqualTo("CANCELADO");

        ResponseEntity<PedidoResponse[]> misPedidosDespues = restTemplate.exchange(
                "/api/pedidos/mios", HttpMethod.GET,
                new HttpEntity<>(authHeaders(ownerToken)), PedidoResponse[].class);
        assertThat(misPedidosDespues.getBody()).extracting(PedidoResponse::id).doesNotContain(pedidoId);
    }

    @Test
    void deliveredPedidoCannotBeCancelled() {
        CrearPedidoRequest crearRequest = new CrearPedidoRequest(
                null, null, false, null, "Pedido a entregar", List.of(new PedidoItemRequest(productoId, 1)));
        ResponseEntity<PedidoResponse> created = restTemplate.exchange(
                "/api/pedidos", HttpMethod.POST,
                new HttpEntity<>(crearRequest, authHeaders(ownerToken)), PedidoResponse.class);
        Long pedidoId = created.getBody().id();

        ResponseEntity<String> entregaForbidden = restTemplate.exchange(
                "/api/pedidos/" + pedidoId + "/estado", HttpMethod.PUT,
                new HttpEntity<>(new CambiarEstadoPedidoRequest(
                        dev.alanbertinat.papeleriagest.domain.EstadoPedido.ENTREGADO), authHeaders(ownerToken)),
                String.class);
        assertThat(entregaForbidden.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);

        ResponseEntity<PedidoResponse> entregado = restTemplate.exchange(
                "/api/pedidos/" + pedidoId + "/estado", HttpMethod.PUT,
                new HttpEntity<>(new CambiarEstadoPedidoRequest(
                        dev.alanbertinat.papeleriagest.domain.EstadoPedido.ENTREGADO), authHeaders(adminToken)),
                PedidoResponse.class);
        assertThat(entregado.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(entregado.getBody().estado()).isEqualTo("ENTREGADO");

        ResponseEntity<String> cancelFails = restTemplate.exchange(
                "/api/pedidos/" + pedidoId + "/cancelar", HttpMethod.PUT,
                new HttpEntity<>(authHeaders(ownerToken)), String.class);
        assertThat(cancelFails.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void crearPedidoDescuentaStockYCancelarLoRestaura() {
        Producto producto = productoRepository.save(Producto.builder()
                .codigoProducto(2002L)
                .nombre("Tijera")
                .precioVenta(new BigDecimal("200.00"))
                .precioCompra(new BigDecimal("100.00"))
                .fechaCarga(java.time.LocalDate.now())
                .activo(true)
                .categoria(categoriaProductoRepository.findAll().get(0))
                .cantidad(10)
                .stockMinimo(2)
                .build());

        CrearPedidoRequest crearRequest = new CrearPedidoRequest(
                null, null, false, null, "Pedido con descuento de stock",
                List.of(new PedidoItemRequest(producto.getCodigoProducto(), 4)));
        ResponseEntity<PedidoResponse> created = restTemplate.exchange(
                "/api/pedidos", HttpMethod.POST,
                new HttpEntity<>(crearRequest, authHeaders(ownerToken)), PedidoResponse.class);
        assertThat(created.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        ResponseEntity<dev.alanbertinat.papeleriagest.web.dto.ProductoResponse> despuesDeCrear = restTemplate.exchange(
                "/api/productos/" + producto.getCodigoProducto(), HttpMethod.GET,
                new HttpEntity<>(authHeaders(ownerToken)), dev.alanbertinat.papeleriagest.web.dto.ProductoResponse.class);
        assertThat(despuesDeCrear.getBody().cantidad()).isEqualTo(6);

        ResponseEntity<PedidoResponse> cancelado = restTemplate.exchange(
                "/api/pedidos/" + created.getBody().id() + "/cancelar", HttpMethod.PUT,
                new HttpEntity<>(authHeaders(ownerToken)), PedidoResponse.class);
        assertThat(cancelado.getStatusCode()).isEqualTo(HttpStatus.OK);

        ResponseEntity<dev.alanbertinat.papeleriagest.web.dto.ProductoResponse> despuesDeCancelar = restTemplate.exchange(
                "/api/productos/" + producto.getCodigoProducto(), HttpMethod.GET,
                new HttpEntity<>(authHeaders(ownerToken)), dev.alanbertinat.papeleriagest.web.dto.ProductoResponse.class);
        assertThat(despuesDeCancelar.getBody().cantidad()).isEqualTo(10);
    }

    @Test
    void noSePuedeCrearPedidoSinStockSuficiente() {
        Producto producto = productoRepository.save(Producto.builder()
                .codigoProducto(2003L)
                .nombre("Regla")
                .precioVenta(new BigDecimal("80.00"))
                .precioCompra(new BigDecimal("40.00"))
                .fechaCarga(java.time.LocalDate.now())
                .activo(true)
                .categoria(categoriaProductoRepository.findAll().get(0))
                .cantidad(2)
                .stockMinimo(1)
                .build());

        CrearPedidoRequest crearRequest = new CrearPedidoRequest(
                null, null, false, null, "Pedido sin stock",
                List.of(new PedidoItemRequest(producto.getCodigoProducto(), 5)));
        ResponseEntity<String> rechazado = restTemplate.exchange(
                "/api/pedidos", HttpMethod.POST,
                new HttpEntity<>(crearRequest, authHeaders(ownerToken)), String.class);
        assertThat(rechazado.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void costoEnvioSeSumaAlTotalCuandoEsEnvio() {
        configuracionRepository.save(Configuracion.builder().nombre("CostoEnvio").valor("150.00").activo(true).build());

        CrearPedidoRequest crearRequest = new CrearPedidoRequest(
                null, null, true, "Calle Falsa 123", "Pedido con envío", List.of(new PedidoItemRequest(productoId, 2)));

        ResponseEntity<PedidoResponse> created = restTemplate.exchange(
                "/api/pedidos", HttpMethod.POST,
                new HttpEntity<>(crearRequest, authHeaders(ownerToken)), PedidoResponse.class);
        assertThat(created.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(created.getBody().precio()).isEqualByComparingTo("1150.00");
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
