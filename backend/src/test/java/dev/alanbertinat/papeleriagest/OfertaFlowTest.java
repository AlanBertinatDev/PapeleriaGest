package dev.alanbertinat.papeleriagest;

import static org.assertj.core.api.Assertions.assertThat;

import dev.alanbertinat.papeleriagest.domain.AudienciaNotificacion;
import dev.alanbertinat.papeleriagest.domain.CategoriaProducto;
import dev.alanbertinat.papeleriagest.domain.Producto;
import dev.alanbertinat.papeleriagest.domain.TipoOferta;
import dev.alanbertinat.papeleriagest.domain.Usuario;
import dev.alanbertinat.papeleriagest.repository.CategoriaProductoRepository;
import dev.alanbertinat.papeleriagest.repository.NivelRepository;
import dev.alanbertinat.papeleriagest.repository.ProductoRepository;
import dev.alanbertinat.papeleriagest.repository.UsuarioRepository;
import dev.alanbertinat.papeleriagest.web.dto.AuthResponse;
import dev.alanbertinat.papeleriagest.web.dto.CrearPedidoRequest;
import dev.alanbertinat.papeleriagest.web.dto.LoginRequest;
import dev.alanbertinat.papeleriagest.web.dto.OfertaRequest;
import dev.alanbertinat.papeleriagest.web.dto.OfertaResponse;
import dev.alanbertinat.papeleriagest.web.dto.PedidoItemRequest;
import dev.alanbertinat.papeleriagest.web.dto.RegisterRequest;
import dev.alanbertinat.papeleriagest.web.dto.UsuarioResponse;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
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
    private Long producto2Id;

    @BeforeAll
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

        Producto producto2 = productoRepository.save(Producto.builder()
                .codigoProducto(3002L)
                .nombre("Lapicera")
                .precioVenta(new BigDecimal("60.00"))
                .precioCompra(new BigDecimal("40.00"))
                .fechaCarga(LocalDate.now())
                .activo(true)
                .categoria(categoria)
                .cantidad(50)
                .stockMinimo(5)
                .build());
        producto2Id = producto2.getCodigoProducto();
    }

    @Test
    void adminCreatesOfertaAndEstandarSeesOnlyVigentes() {
        OfertaRequest vigente = new OfertaRequest(
                "Descuento cuadernos", "20% en cuadernos", new BigDecimal("100.00"),
                LocalDate.now().minusDays(1), LocalDate.now().plusDays(5), TipoOferta.PRODUCTO,
                List.of(productoId), false, null);
        OfertaRequest vencida = new OfertaRequest(
                "Oferta vieja", "ya vencida", new BigDecimal("50.00"),
                LocalDate.now().minusDays(10), LocalDate.now().minusDays(1), TipoOferta.PRODUCTO,
                List.of(productoId), false, null);

        ResponseEntity<String> forbidden = restTemplate.exchange(
                "/api/ofertas", HttpMethod.POST,
                new HttpEntity<>(vigente, authHeaders(estandarToken)), String.class);
        assertThat(forbidden.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);

        ResponseEntity<OfertaResponse> created = restTemplate.exchange(
                "/api/ofertas", HttpMethod.POST,
                new HttpEntity<>(vigente, authHeaders(adminToken)), OfertaResponse.class);
        assertThat(created.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(created.getBody().tieneImagen()).isFalse();
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
        assertThat(vigentes.getBody()).extracting(OfertaResponse::id).contains(vigenteId);

        ResponseEntity<String> todasForbidden = restTemplate.exchange(
                "/api/ofertas/todas", HttpMethod.GET,
                new HttpEntity<>(authHeaders(estandarToken)), String.class);
        assertThat(todasForbidden.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);

        ResponseEntity<OfertaResponse[]> todas = restTemplate.exchange(
                "/api/ofertas/todas", HttpMethod.GET,
                new HttpEntity<>(authHeaders(adminToken)), OfertaResponse[].class);
        assertThat(todas.getBody()).extracting(OfertaResponse::id).contains(vigenteId, createdVencida.getBody().id());

        ResponseEntity<Void> deleted = restTemplate.exchange(
                "/api/ofertas/" + vigenteId, HttpMethod.DELETE,
                new HttpEntity<>(authHeaders(adminToken)), Void.class);
        assertThat(deleted.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

        ResponseEntity<OfertaResponse[]> vigentesDespues = restTemplate.exchange(
                "/api/ofertas", HttpMethod.GET,
                new HttpEntity<>(authHeaders(estandarToken)), OfertaResponse[].class);
        assertThat(vigentesDespues.getBody()).extracting(OfertaResponse::id).doesNotContain(vigenteId);
    }

    @Test
    void productoConCantidadInvalidaDeProductosFalla() {
        OfertaRequest sinProductos = ofertaRequest(TipoOferta.PRODUCTO, List.of());
        OfertaRequest dosProductos = ofertaRequest(TipoOferta.PRODUCTO, List.of(productoId, producto2Id));

        assertThat(crearEsperandoError(sinProductos).getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(crearEsperandoError(dosProductos).getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void packConUnSoloProductoFalla() {
        OfertaRequest request = ofertaRequest(TipoOferta.PACK, List.of(productoId));
        assertThat(crearEsperandoError(request).getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void servicioConProductosFalla() {
        OfertaRequest request = ofertaRequest(TipoOferta.SERVICIO, List.of(productoId));
        assertThat(crearEsperandoError(request).getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void servicioSinProductosSeCreaCorrectamente() {
        OfertaRequest request = ofertaRequest(TipoOferta.SERVICIO, List.of());
        ResponseEntity<OfertaResponse> response = crear(request);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody().productos()).isEmpty();
        assertThat(response.getBody().tipo()).isEqualTo(TipoOferta.SERVICIO);
    }

    @Test
    void editarOfertaActualizaCampos() {
        ResponseEntity<OfertaResponse> creada = crear(ofertaRequest(TipoOferta.PRODUCTO, List.of(productoId)));
        Long id = creada.getBody().id();

        OfertaRequest edicion = new OfertaRequest(
                "Título editado", "descripción editada", new BigDecimal("77.00"),
                LocalDate.now(), LocalDate.now().plusDays(3), TipoOferta.PACK,
                List.of(productoId, producto2Id), false, null);

        ResponseEntity<OfertaResponse> actualizada = restTemplate.exchange(
                "/api/ofertas/" + id, HttpMethod.PUT,
                new HttpEntity<>(edicion, authHeaders(adminToken)), OfertaResponse.class);
        assertThat(actualizada.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(actualizada.getBody().titulo()).isEqualTo("Título editado");
        assertThat(actualizada.getBody().tipo()).isEqualTo(TipoOferta.PACK);
        assertThat(actualizada.getBody().productos()).hasSize(2);
    }

    @Test
    void subirYObtenerImagenDeOferta() {
        ResponseEntity<OfertaResponse> creada = crear(ofertaRequest(TipoOferta.PRODUCTO, List.of(productoId)));
        Long id = creada.getBody().id();
        assertThat(creada.getBody().tieneImagen()).isFalse();

        MultiValueMap<String, Object> partes = new LinkedMultiValueMap<>();
        ByteArrayResource imagen = new ByteArrayResource("contenido-oferta".getBytes(StandardCharsets.UTF_8)) {
            @Override
            public String getFilename() {
                return "oferta.jpg";
            }
        };
        partes.add("archivo", imagen);
        HttpHeaders imagenHeaders = authHeaders(adminToken);
        imagenHeaders.setContentType(MediaType.MULTIPART_FORM_DATA);

        ResponseEntity<OfertaResponse> conImagen = restTemplate.exchange(
                "/api/ofertas/" + id + "/imagen", HttpMethod.POST,
                new HttpEntity<>(partes, imagenHeaders), OfertaResponse.class);
        assertThat(conImagen.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(conImagen.getBody().tieneImagen()).isTrue();

        ResponseEntity<byte[]> descargada = restTemplate.exchange(
                "/api/ofertas/" + id + "/imagen", HttpMethod.GET,
                new HttpEntity<>(authHeaders(estandarToken)), byte[].class);
        assertThat(descargada.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(descargada.getBody()).isEqualTo("contenido-oferta".getBytes(StandardCharsets.UTF_8));
    }

    @Test
    void notificarATodosLosClientesCuentaCorrectamente() {
        ResponseEntity<UsuarioResponse[]> usuarios = restTemplate.exchange(
                "/api/usuarios", HttpMethod.GET,
                new HttpEntity<>(authHeaders(adminToken)), UsuarioResponse[].class);
        long esperados = List.of(usuarios.getBody()).stream()
                .filter(u -> "Estandar".equals(u.nivel()) && u.activo())
                .count();

        OfertaRequest request = new OfertaRequest(
                "Oferta notificada", null, new BigDecimal("10.00"),
                LocalDate.now(), LocalDate.now().plusDays(5), TipoOferta.PRODUCTO,
                List.of(productoId), true, AudienciaNotificacion.TODOS);

        ResponseEntity<OfertaResponse> response = crear(request);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody().notificado()).isTrue();
        assertThat(response.getBody().notificadoCantidad()).isEqualTo((int) esperados);
        assertThat(response.getBody().audienciaNotificacion()).isEqualTo(AudienciaNotificacion.TODOS);
    }

    @Test
    void notificarASoloCompraronCategoria() {
        CategoriaProducto categoriaExclusiva = categoriaProductoRepository.save(
                CategoriaProducto.builder().nombre("Categoría Exclusiva Notificación").porcentaje(15).activo(true).build());
        Producto productoExclusivo = productoRepository.save(Producto.builder()
                .codigoProducto(3003L)
                .nombre("Producto Exclusivo")
                .precioVenta(new BigDecimal("500.00"))
                .precioCompra(new BigDecimal("300.00"))
                .fechaCarga(LocalDate.now())
                .activo(true)
                .categoria(categoriaExclusiva)
                .cantidad(20)
                .stockMinimo(2)
                .build());

        String compradorToken = register(
                "Cliente Comprador", "cliente-comprador-oferta@example.com", "cliente-comprador-oferta-cedula",
                "clientepass123");
        register("Cliente Sin Compra", "cliente-sin-compra-oferta@example.com", "cliente-sin-compra-oferta-cedula",
                "clientepass123");

        CrearPedidoRequest pedidoRequest = new CrearPedidoRequest(
                null, null, false, null, "Compra categoría exclusiva",
                List.of(new PedidoItemRequest(productoExclusivo.getCodigoProducto(), 1)));
        ResponseEntity<Void> pedido = restTemplate.exchange(
                "/api/pedidos", HttpMethod.POST,
                new HttpEntity<>(pedidoRequest, authHeaders(compradorToken)), Void.class);
        assertThat(pedido.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        OfertaRequest request = new OfertaRequest(
                "Oferta categoría exclusiva", null, new BigDecimal("15.00"),
                LocalDate.now(), LocalDate.now().plusDays(5), TipoOferta.PRODUCTO,
                List.of(productoExclusivo.getCodigoProducto()), true, AudienciaNotificacion.CATEGORIA);

        ResponseEntity<OfertaResponse> response = crear(request);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody().notificado()).isTrue();
        assertThat(response.getBody().notificadoCantidad()).isEqualTo(1);
    }

    @Test
    void audienciaCategoriaConServicioFalla() {
        OfertaRequest request = new OfertaRequest(
                "Servicio con audiencia inválida", null, new BigDecimal("15.00"),
                LocalDate.now(), LocalDate.now().plusDays(5), TipoOferta.SERVICIO,
                List.of(), true, AudienciaNotificacion.CATEGORIA);

        assertThat(crearEsperandoError(request).getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    private OfertaRequest ofertaRequest(TipoOferta tipo, List<Long> productoIds) {
        return new OfertaRequest(
                "Oferta de prueba " + tipo, null, new BigDecimal("10.00"),
                LocalDate.now(), LocalDate.now().plusDays(5), tipo, productoIds, false, null);
    }

    private ResponseEntity<OfertaResponse> crear(OfertaRequest request) {
        return restTemplate.exchange(
                "/api/ofertas", HttpMethod.POST,
                new HttpEntity<>(request, authHeaders(adminToken)), OfertaResponse.class);
    }

    private ResponseEntity<String> crearEsperandoError(OfertaRequest request) {
        return restTemplate.exchange(
                "/api/ofertas", HttpMethod.POST,
                new HttpEntity<>(request, authHeaders(adminToken)), String.class);
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
