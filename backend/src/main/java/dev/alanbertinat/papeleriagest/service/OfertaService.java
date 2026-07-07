package dev.alanbertinat.papeleriagest.service;

import dev.alanbertinat.papeleriagest.domain.AudienciaNotificacion;
import dev.alanbertinat.papeleriagest.domain.Oferta;
import dev.alanbertinat.papeleriagest.domain.Producto;
import dev.alanbertinat.papeleriagest.domain.TipoOferta;
import dev.alanbertinat.papeleriagest.domain.Usuario;
import dev.alanbertinat.papeleriagest.exception.ConflictException;
import dev.alanbertinat.papeleriagest.exception.ResourceNotFoundException;
import dev.alanbertinat.papeleriagest.repository.OfertaRepository;
import dev.alanbertinat.papeleriagest.repository.ProductoRepository;
import dev.alanbertinat.papeleriagest.repository.UsuarioRepository;
import dev.alanbertinat.papeleriagest.web.dto.OfertaRequest;
import dev.alanbertinat.papeleriagest.web.dto.OfertaResponse;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class OfertaService {

    private final OfertaRepository ofertaRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final FileStorageService fileStorageService;
    private final EmailService emailService;

    public OfertaService(
            OfertaRepository ofertaRepository,
            ProductoRepository productoRepository,
            UsuarioRepository usuarioRepository,
            FileStorageService fileStorageService,
            EmailService emailService) {
        this.ofertaRepository = ofertaRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
        this.fileStorageService = fileStorageService;
        this.emailService = emailService;
    }

    @Transactional
    public OfertaResponse crear(Usuario usuario, OfertaRequest request) {
        Set<Producto> productos = resolverProductos(request.productoIds());
        validarTipoYProductos(request.tipo(), productos, request.audienciaNotificacion());

        Oferta oferta = Oferta.builder()
                .titulo(request.titulo())
                .descripcion(request.descripcion())
                .precio(request.precio())
                .fechaDesde(request.fechaDesde())
                .fechaHasta(request.fechaHasta())
                .tipo(request.tipo())
                .activo(true)
                .usuario(usuario)
                .productos(productos)
                .build();

        if (request.notificarPorCorreo()) {
            notificar(oferta, request.audienciaNotificacion());
        }

        return OfertaResponse.from(ofertaRepository.save(oferta));
    }

    @Transactional
    public OfertaResponse actualizar(Long id, OfertaRequest request) {
        Oferta oferta = buscar(id);
        Set<Producto> productos = resolverProductos(request.productoIds());
        validarTipoYProductos(request.tipo(), productos, request.audienciaNotificacion());

        oferta.setTitulo(request.titulo());
        oferta.setDescripcion(request.descripcion());
        oferta.setPrecio(request.precio());
        oferta.setFechaDesde(request.fechaDesde());
        oferta.setFechaHasta(request.fechaHasta());
        oferta.setTipo(request.tipo());
        oferta.setProductos(productos);

        if (request.notificarPorCorreo() && !oferta.isNotificado()) {
            notificar(oferta, request.audienciaNotificacion());
        }

        return OfertaResponse.from(ofertaRepository.save(oferta));
    }

    @Transactional(readOnly = true)
    public List<OfertaResponse> listarVigentes() {
        LocalDate hoy = LocalDate.now();
        return ofertaRepository
                .findByActivoTrueAndFechaDesdeLessThanEqualAndFechaHastaGreaterThanEqualOrderByFechaDesdeDesc(
                        hoy, hoy)
                .stream()
                .map(OfertaResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OfertaResponse> listarTodas() {
        return ofertaRepository.findByActivoTrueOrderByFechaDesdeDesc().stream()
                .map(OfertaResponse::from)
                .toList();
    }

    @Transactional
    public void desactivar(Long id) {
        Oferta oferta = buscar(id);
        oferta.setActivo(false);
        ofertaRepository.save(oferta);
    }

    @Transactional
    public OfertaResponse actualizarImagen(Long id, MultipartFile archivo) {
        Oferta oferta = buscar(id);
        oferta.setImagenArchivo(fileStorageService.guardar(archivo));
        return OfertaResponse.from(ofertaRepository.save(oferta));
    }

    @Transactional(readOnly = true)
    public ArchivoDescarga obtenerImagen(Long id) {
        Oferta oferta = buscar(id);
        if (oferta.getImagenArchivo() == null) {
            throw new ResourceNotFoundException("La oferta no tiene imagen");
        }
        Path path = fileStorageService.resolver(oferta.getImagenArchivo());
        Resource recurso = new FileSystemResource(path);
        if (!recurso.exists()) {
            throw new ResourceNotFoundException("La imagen ya no está disponible en el servidor");
        }
        return new ArchivoDescarga(recurso, oferta.getImagenArchivo());
    }

    private Oferta buscar(Long id) {
        return ofertaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Oferta no encontrada: " + id));
    }

    private Set<Producto> resolverProductos(List<Long> productoIds) {
        Set<Producto> productos = new HashSet<>();
        for (Long productoId : productoIds) {
            productos.add(productoRepository.findById(productoId)
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + productoId)));
        }
        return productos;
    }

    private void validarTipoYProductos(TipoOferta tipo, Set<Producto> productos, AudienciaNotificacion audiencia) {
        switch (tipo) {
            case PRODUCTO -> {
                if (productos.size() != 1) {
                    throw new ConflictException("Una oferta de tipo Producto debe tener exactamente un producto");
                }
            }
            case PACK -> {
                if (productos.size() < 2) {
                    throw new ConflictException("Una oferta de tipo Pack debe tener al menos dos productos");
                }
            }
            case SERVICIO -> {
                if (!productos.isEmpty()) {
                    throw new ConflictException("Una oferta de tipo Servicio no puede tener productos asociados");
                }
            }
        }
        if (audiencia == AudienciaNotificacion.CATEGORIA && tipo == TipoOferta.SERVICIO) {
            throw new ConflictException(
                    "La audiencia \"Solo compraron esta categoría\" no aplica a ofertas de tipo Servicio");
        }
    }

    private void notificar(Oferta oferta, AudienciaNotificacion audiencia) {
        if (audiencia == null) {
            throw new ConflictException("Elegí una audiencia para notificar por correo");
        }
        List<String> destinatarios = resolverDestinatarios(oferta, audiencia);
        emailService.notificarClientesOferta(oferta.getTitulo(), construirCuerpo(oferta), destinatarios);
        oferta.setNotificado(true);
        oferta.setNotificadoCantidad(destinatarios.size());
        oferta.setAudienciaNotificacion(audiencia);
    }

    private List<String> resolverDestinatarios(Oferta oferta, AudienciaNotificacion audiencia) {
        if (audiencia == AudienciaNotificacion.CATEGORIA) {
            Set<Long> categoriaIds = oferta.getProductos().stream()
                    .map(p -> p.getCategoria().getId())
                    .collect(Collectors.toSet());
            return usuarioRepository.emailsClientesQueCompraronCategoria(categoriaIds);
        }
        return usuarioRepository.emailsClientesEstandarActivos();
    }

    private String construirCuerpo(Oferta oferta) {
        return "Tenemos una nueva oferta para vos: " + oferta.getTitulo()
                + " a $" + oferta.getPrecio()
                + ". Vigente del " + oferta.getFechaDesde() + " al " + oferta.getFechaHasta() + ".";
    }
}
