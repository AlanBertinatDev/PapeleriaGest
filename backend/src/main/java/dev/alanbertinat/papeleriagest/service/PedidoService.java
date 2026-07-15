package dev.alanbertinat.papeleriagest.service;

import dev.alanbertinat.papeleriagest.domain.EstadoPedido;
import dev.alanbertinat.papeleriagest.domain.Oferta;
import dev.alanbertinat.papeleriagest.domain.Pedido;
import dev.alanbertinat.papeleriagest.domain.PedidoItem;
import dev.alanbertinat.papeleriagest.domain.Producto;
import dev.alanbertinat.papeleriagest.domain.Usuario;
import dev.alanbertinat.papeleriagest.exception.ConflictException;
import dev.alanbertinat.papeleriagest.exception.ResourceNotFoundException;
import dev.alanbertinat.papeleriagest.repository.ConfiguracionRepository;
import dev.alanbertinat.papeleriagest.repository.OfertaRepository;
import dev.alanbertinat.papeleriagest.repository.PedidoRepository;
import dev.alanbertinat.papeleriagest.repository.ProductoRepository;
import dev.alanbertinat.papeleriagest.web.dto.CrearPedidoRequest;
import dev.alanbertinat.papeleriagest.web.dto.PedidoItemRequest;
import dev.alanbertinat.papeleriagest.web.dto.PedidoResponse;
import dev.alanbertinat.papeleriagest.web.dto.TarifasResponse;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PedidoService {

    private static final Logger log = LoggerFactory.getLogger(PedidoService.class);

    private static final Map<EstadoPedido, Set<EstadoPedido>> TRANSICIONES_VALIDAS = Map.of(
            EstadoPedido.PENDIENTE, Set.of(EstadoPedido.LISTO, EstadoPedido.CANCELADO),
            EstadoPedido.EN_REVISION, Set.of(EstadoPedido.PENDIENTE, EstadoPedido.CANCELADO),
            EstadoPedido.LISTO, Set.of(EstadoPedido.ENTREGADO, EstadoPedido.CANCELADO),
            EstadoPedido.ENTREGADO, Set.of(),
            EstadoPedido.CANCELADO, Set.of(EstadoPedido.PENDIENTE));

    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;
    private final OfertaRepository ofertaRepository;
    private final ConfiguracionRepository configuracionRepository;
    private final NotificacionService notificacionService;
    private final EmailService emailService;

    public PedidoService(
            PedidoRepository pedidoRepository,
            ProductoRepository productoRepository,
            OfertaRepository ofertaRepository,
            ConfiguracionRepository configuracionRepository,
            NotificacionService notificacionService,
            EmailService emailService) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
        this.ofertaRepository = ofertaRepository;
        this.configuracionRepository = configuracionRepository;
        this.notificacionService = notificacionService;
        this.emailService = emailService;
    }

    @Transactional
    public PedidoResponse crear(Usuario usuario, CrearPedidoRequest request) {
        Pedido pedido = Pedido.builder()
                .fechaPedido(LocalDateTime.now())
                .fechaEntrega(request.fechaEntrega())
                .horaEntrega(request.horaEntrega())
                .activo(true)
                .esEnvio(request.esEnvio())
                .direccion(request.direccion())
                .descripcion(request.descripcion())
                .estado(EstadoPedido.PENDIENTE)
                .precio(BigDecimal.ZERO)
                .usuario(usuario)
                .build();

        BigDecimal total = BigDecimal.ZERO;
        for (PedidoItemRequest itemRequest : request.items()) {
            if (itemRequest.productoId() != null && itemRequest.ofertaId() != null) {
                throw new ConflictException("Un ítem del pedido no puede ser producto y oferta a la vez");
            }
            if (itemRequest.productoId() != null) {
                total = total.add(agregarItemProducto(pedido, itemRequest));
            } else if (itemRequest.ofertaId() != null) {
                total = total.add(agregarItemOferta(pedido, itemRequest));
            } else {
                throw new ConflictException("Cada ítem del pedido debe indicar un producto o una oferta");
            }
        }
        if (request.esEnvio()) {
            total = total.add(costoEnvio());
        }
        pedido.setPrecio(total);

        Pedido guardado = pedidoRepository.save(pedido);
        notificacionService.registrarPedido(usuario, "Creó el pedido #" + guardado.getId());
        emailService.notificarAdmin(
                "Nuevo pedido #" + guardado.getId(),
                usuario.getNombre() + " hizo un pedido por un total de $" + guardado.getPrecio());
        return PedidoResponse.from(guardado);
    }

    private BigDecimal agregarItemProducto(Pedido pedido, PedidoItemRequest itemRequest) {
        Producto producto = productoRepository.findById(itemRequest.productoId())
                .filter(Producto::isActivo)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Producto no encontrado o inactivo: " + itemRequest.productoId()));
        descontarStock(producto, itemRequest.cantidad());

        PedidoItem item = PedidoItem.builder()
                .pedido(pedido)
                .producto(producto)
                .cantidad(itemRequest.cantidad())
                .precioUnitario(producto.getPrecioVenta())
                .build();
        pedido.getItems().add(item);
        return producto.getPrecioVenta().multiply(BigDecimal.valueOf(itemRequest.cantidad()));
    }

    private BigDecimal agregarItemOferta(Pedido pedido, PedidoItemRequest itemRequest) {
        Oferta oferta = ofertaRepository.findById(itemRequest.ofertaId())
                .orElseThrow(() -> new ResourceNotFoundException("Oferta no encontrada: " + itemRequest.ofertaId()));
        if (!oferta.isActivo() || !vigente(oferta)) {
            throw new ConflictException("La oferta \"" + oferta.getTitulo() + "\" ya no está disponible");
        }
        for (Producto producto : oferta.getProductos()) {
            descontarStock(producto, itemRequest.cantidad());
        }

        PedidoItem item = PedidoItem.builder()
                .pedido(pedido)
                .oferta(oferta)
                .cantidad(itemRequest.cantidad())
                .precioUnitario(oferta.getPrecio())
                .build();
        pedido.getItems().add(item);
        return oferta.getPrecio().multiply(BigDecimal.valueOf(itemRequest.cantidad()));
    }

    private void descontarStock(Producto producto, int cantidad) {
        if (producto.getCantidad() < cantidad) {
            throw new ConflictException(
                    "Stock insuficiente de " + producto.getNombre() + " (disponible: " + producto.getCantidad() + ")");
        }
        producto.setCantidad(producto.getCantidad() - cantidad);
        productoRepository.save(producto);
    }

    private boolean vigente(Oferta oferta) {
        LocalDate hoy = LocalDate.now();
        return !oferta.getFechaDesde().isAfter(hoy) && !oferta.getFechaHasta().isBefore(hoy);
    }

    private BigDecimal costoEnvio() {
        return costoConfigurado("CostoEnvio");
    }

    @Transactional(readOnly = true)
    public TarifasResponse obtenerTarifas() {
        return new TarifasResponse(costoEnvio());
    }

    private BigDecimal costoConfigurado(String nombre) {
        return configuracionRepository.findByNombreAndActivoTrue(nombre)
                .map(dev.alanbertinat.papeleriagest.domain.Configuracion::getValor)
                .filter(v -> v != null && !v.isBlank())
                .map(v -> {
                    try {
                        return new BigDecimal(v);
                    } catch (NumberFormatException ex) {
                        log.warn("Configuración \"{}\" tiene un valor no numérico (\"{}\"), usando $0", nombre, v);
                        return BigDecimal.ZERO;
                    }
                })
                .orElse(BigDecimal.ZERO);
    }

    @Transactional(readOnly = true)
    public PedidoResponse buscar(Long id, Usuario actor) {
        Pedido pedido = buscarEntidad(id);
        verificarPropietarioOAdmin(pedido, actor);
        return PedidoResponse.from(pedido);
    }

    private static final int LIMITE_LISTADO_ADMIN = 500;

    @Transactional(readOnly = true)
    public List<PedidoResponse> listarTodos() {
        return pedidoRepository
                .findByActivoTrueOrderByFechaPedidoDesc(
                        org.springframework.data.domain.PageRequest.of(0, LIMITE_LISTADO_ADMIN))
                .stream()
                .map(PedidoResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PedidoResponse> listarMios(Usuario usuario) {
        return pedidoRepository
                .findByActivoTrueAndUsuarioIdAndEstadoNotOrderByFechaPedidoDesc(
                        usuario.getId(), EstadoPedido.CANCELADO)
                .stream()
                .map(PedidoResponse::from)
                .toList();
    }

    @Transactional
    public PedidoResponse cancelar(Long id, Usuario actor) {
        Pedido pedido = buscarEntidad(id);
        verificarPropietarioOAdmin(pedido, actor);
        if (pedido.getEstado() == EstadoPedido.ENTREGADO) {
            throw new ConflictException("No se puede cancelar un pedido ya entregado");
        }
        for (PedidoItem item : pedido.getItems()) {
            reponerStock(item);
        }
        pedido.setEstado(EstadoPedido.CANCELADO);
        pedido.setActivo(false);
        return PedidoResponse.from(pedidoRepository.save(pedido));
    }

    private void reponerStock(PedidoItem item) {
        for (Producto producto : productosDe(item)) {
            producto.setCantidad(producto.getCantidad() + item.getCantidad());
            productoRepository.save(producto);
        }
    }

    @Transactional
    public PedidoResponse cambiarEstado(Long id, EstadoPedido nuevoEstado) {
        if (nuevoEstado == EstadoPedido.EN_REVISION) {
            throw new ConflictException("Para poner un pedido en revisión hay que indicar un motivo");
        }
        Pedido pedido = buscarEntidad(id);
        EstadoPedido estadoActual = pedido.getEstado();
        if (!TRANSICIONES_VALIDAS.getOrDefault(estadoActual, Set.of()).contains(nuevoEstado)) {
            throw new ConflictException(
                    "No se puede pasar un pedido de " + estadoActual + " a " + nuevoEstado);
        }
        if (estadoActual == EstadoPedido.CANCELADO) {
            reabrir(pedido);
            return PedidoResponse.from(pedidoRepository.save(pedido));
        }
        if (nuevoEstado == EstadoPedido.CANCELADO) {
            for (PedidoItem item : pedido.getItems()) {
                reponerStock(item);
            }
        }
        pedido.setEstado(nuevoEstado);
        Pedido guardado = pedidoRepository.save(pedido);
        if (nuevoEstado == EstadoPedido.LISTO) {
            emailService.notificarCliente(
                    guardado.getUsuario().getEmail(),
                    "Tu pedido #" + guardado.getId() + " está listo",
                    guardado.isEsEnvio()
                            ? "Ya preparamos tu pedido y en breve coordinamos la entrega a domicilio."
                            : "Ya podés pasar a retirar tu pedido por el local.");
        } else if (nuevoEstado == EstadoPedido.CANCELADO) {
            emailService.notificarCliente(
                    guardado.getUsuario().getEmail(),
                    "Tu pedido #" + guardado.getId() + " fue cancelado",
                    "Tu pedido fue cancelado. Si tenés dudas, respondé este correo o escribinos.");
        }
        return PedidoResponse.from(guardado);
    }

    @Transactional
    public PedidoResponse marcarEnRevision(Long id, String motivo) {
        Pedido pedido = buscarEntidad(id);
        if (pedido.getEstado() == EstadoPedido.CANCELADO || pedido.getEstado() == EstadoPedido.ENTREGADO) {
            throw new ConflictException(
                    "No se puede poner en revisión un pedido " + pedido.getEstado().name().toLowerCase());
        }
        pedido.setEstado(EstadoPedido.EN_REVISION);
        pedido.setMotivoRevision(motivo);
        return PedidoResponse.from(pedidoRepository.save(pedido));
    }

    @Transactional
    public PedidoResponse actualizarItems(Long id, List<PedidoItemRequest> nuevosItems) {
        Pedido pedido = buscarEntidad(id);
        if (pedido.getEstado() != EstadoPedido.PENDIENTE && pedido.getEstado() != EstadoPedido.EN_REVISION) {
            throw new ConflictException("Solo se pueden editar los ítems de un pedido pendiente o en revisión");
        }

        for (PedidoItem item : pedido.getItems()) {
            reponerStock(item);
        }
        pedido.getItems().clear();

        BigDecimal total = BigDecimal.ZERO;
        for (PedidoItemRequest itemRequest : nuevosItems) {
            if (itemRequest.productoId() != null && itemRequest.ofertaId() != null) {
                throw new ConflictException("Un ítem del pedido no puede ser producto y oferta a la vez");
            }
            if (itemRequest.productoId() != null) {
                total = total.add(agregarItemProducto(pedido, itemRequest));
            } else if (itemRequest.ofertaId() != null) {
                total = total.add(agregarItemOferta(pedido, itemRequest));
            } else {
                throw new ConflictException("Cada ítem del pedido debe indicar un producto o una oferta");
            }
        }
        if (pedido.isEsEnvio()) {
            total = total.add(costoEnvio());
        }
        pedido.setPrecio(total);
        pedido.setActualizadoEn(LocalDateTime.now());

        Pedido guardado = pedidoRepository.save(pedido);
        emailService.notificarCliente(
                guardado.getUsuario().getEmail(),
                "Actualizamos tu pedido #" + guardado.getId(),
                resumenItems(guardado) + "\n\nNuevo total: $" + guardado.getPrecio()
                        + "\n\nSi tenés dudas, respondé este correo o escribinos.");
        return PedidoResponse.from(guardado);
    }

    private String resumenItems(Pedido pedido) {
        StringBuilder sb = new StringBuilder("Así quedó tu pedido #" + pedido.getId() + ":\n");
        for (PedidoItem item : pedido.getItems()) {
            String nombre = item.getOferta() != null ? item.getOferta().getTitulo() : item.getProducto().getNombre();
            sb.append("- ").append(nombre).append(" x").append(item.getCantidad()).append('\n');
        }
        return sb.toString();
    }

    private void reabrir(Pedido pedido) {
        for (PedidoItem item : pedido.getItems()) {
            for (Producto producto : productosDe(item)) {
                if (producto.getCantidad() < item.getCantidad()) {
                    throw new ConflictException("Stock insuficiente de " + producto.getNombre()
                            + " para reabrir el pedido (disponible: " + producto.getCantidad() + ")");
                }
            }
        }
        for (PedidoItem item : pedido.getItems()) {
            for (Producto producto : productosDe(item)) {
                producto.setCantidad(producto.getCantidad() - item.getCantidad());
                productoRepository.save(producto);
            }
        }
        pedido.setEstado(EstadoPedido.PENDIENTE);
        pedido.setActivo(true);
    }

    private List<Producto> productosDe(PedidoItem item) {
        return item.getOferta() != null ? item.getOferta().getProductos().stream().toList() : List.of(item.getProducto());
    }

    private Pedido buscarEntidad(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado: " + id));
    }

    private void verificarPropietarioOAdmin(Pedido pedido, Usuario actor) {
        boolean esPropietario = pedido.getUsuario().getId().equals(actor.getId());
        boolean esAdmin = actor.getNivel().isAdmin();
        if (!esPropietario && !esAdmin) {
            throw new AccessDeniedException("No tenés acceso a este pedido");
        }
    }
}
