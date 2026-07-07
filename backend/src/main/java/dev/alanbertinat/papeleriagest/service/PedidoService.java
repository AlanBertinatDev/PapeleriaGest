package dev.alanbertinat.papeleriagest.service;

import dev.alanbertinat.papeleriagest.domain.EstadoPedido;
import dev.alanbertinat.papeleriagest.domain.Pedido;
import dev.alanbertinat.papeleriagest.domain.PedidoItem;
import dev.alanbertinat.papeleriagest.domain.Producto;
import dev.alanbertinat.papeleriagest.domain.Usuario;
import dev.alanbertinat.papeleriagest.exception.ConflictException;
import dev.alanbertinat.papeleriagest.exception.ResourceNotFoundException;
import dev.alanbertinat.papeleriagest.repository.ConfiguracionRepository;
import dev.alanbertinat.papeleriagest.repository.PedidoRepository;
import dev.alanbertinat.papeleriagest.repository.ProductoRepository;
import dev.alanbertinat.papeleriagest.web.dto.CrearPedidoRequest;
import dev.alanbertinat.papeleriagest.web.dto.PedidoItemRequest;
import dev.alanbertinat.papeleriagest.web.dto.PedidoResponse;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;
    private final ConfiguracionRepository configuracionRepository;
    private final NotificacionService notificacionService;
    private final EmailService emailService;

    public PedidoService(
            PedidoRepository pedidoRepository,
            ProductoRepository productoRepository,
            ConfiguracionRepository configuracionRepository,
            NotificacionService notificacionService,
            EmailService emailService) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
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
            Producto producto = productoRepository.findById(itemRequest.productoId())
                    .filter(Producto::isActivo)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Producto no encontrado o inactivo: " + itemRequest.productoId()));

            if (producto.getCantidad() < itemRequest.cantidad()) {
                throw new ConflictException(
                        "Stock insuficiente de " + producto.getNombre() + " (disponible: " + producto.getCantidad() + ")");
            }
            producto.setCantidad(producto.getCantidad() - itemRequest.cantidad());
            productoRepository.save(producto);

            PedidoItem item = PedidoItem.builder()
                    .pedido(pedido)
                    .producto(producto)
                    .cantidad(itemRequest.cantidad())
                    .build();
            pedido.getItems().add(item);

            total = total.add(producto.getPrecioVenta().multiply(BigDecimal.valueOf(itemRequest.cantidad())));
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

    private BigDecimal costoEnvio() {
        return configuracionRepository.findByNombreAndActivoTrue("CostoEnvio")
                .map(dev.alanbertinat.papeleriagest.domain.Configuracion::getValor)
                .filter(v -> v != null && !v.isBlank())
                .map(v -> {
                    try {
                        return new BigDecimal(v);
                    } catch (NumberFormatException ex) {
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

    @Transactional(readOnly = true)
    public List<PedidoResponse> listarTodos() {
        return pedidoRepository.findByActivoTrueOrderByFechaPedidoDesc().stream()
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
            Producto producto = item.getProducto();
            producto.setCantidad(producto.getCantidad() + item.getCantidad());
            productoRepository.save(producto);
        }
        pedido.setEstado(EstadoPedido.CANCELADO);
        pedido.setActivo(false);
        return PedidoResponse.from(pedidoRepository.save(pedido));
    }

    @Transactional
    public PedidoResponse cambiarEstado(Long id, EstadoPedido nuevoEstado) {
        Pedido pedido = buscarEntidad(id);
        if (pedido.getEstado() == EstadoPedido.CANCELADO) {
            if (nuevoEstado != EstadoPedido.PENDIENTE) {
                throw new ConflictException("Un pedido cancelado solo se puede reabrir como pendiente");
            }
            reabrir(pedido);
            return PedidoResponse.from(pedidoRepository.save(pedido));
        }
        pedido.setEstado(nuevoEstado);
        return PedidoResponse.from(pedidoRepository.save(pedido));
    }

    private void reabrir(Pedido pedido) {
        for (PedidoItem item : pedido.getItems()) {
            Producto producto = item.getProducto();
            if (producto.getCantidad() < item.getCantidad()) {
                throw new ConflictException("Stock insuficiente de " + producto.getNombre()
                        + " para reabrir el pedido (disponible: " + producto.getCantidad() + ")");
            }
            producto.setCantidad(producto.getCantidad() - item.getCantidad());
            productoRepository.save(producto);
        }
        pedido.setEstado(EstadoPedido.PENDIENTE);
        pedido.setActivo(true);
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
