package dev.alanbertinat.papeleriagest.service;

import dev.alanbertinat.papeleriagest.domain.Curso;
import dev.alanbertinat.papeleriagest.domain.Documento;
import dev.alanbertinat.papeleriagest.domain.EstadoDocumento;
import dev.alanbertinat.papeleriagest.domain.EstadoPedido;
import dev.alanbertinat.papeleriagest.domain.OrigenDocumento;
import dev.alanbertinat.papeleriagest.domain.Pedido;
import dev.alanbertinat.papeleriagest.domain.Usuario;
import dev.alanbertinat.papeleriagest.exception.ConflictException;
import dev.alanbertinat.papeleriagest.exception.ResourceNotFoundException;
import dev.alanbertinat.papeleriagest.repository.ConfiguracionRepository;
import dev.alanbertinat.papeleriagest.repository.CursoRepository;
import dev.alanbertinat.papeleriagest.repository.DocumentoRepository;
import dev.alanbertinat.papeleriagest.repository.PedidoRepository;
import dev.alanbertinat.papeleriagest.web.dto.CotizarImpresionRequest;
import dev.alanbertinat.papeleriagest.web.dto.DocumentoRequest;
import dev.alanbertinat.papeleriagest.web.dto.DocumentoResponse;
import dev.alanbertinat.papeleriagest.web.dto.SolicitarImpresionRequest;
import java.math.BigDecimal;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DocumentoService {

    private static final Logger log = LoggerFactory.getLogger(DocumentoService.class);

    private final DocumentoRepository documentoRepository;
    private final PedidoRepository pedidoRepository;
    private final CursoRepository cursoRepository;
    private final ConfiguracionRepository configuracionRepository;
    private final NotificacionService notificacionService;
    private final EmailService emailService;
    private final FileStorageService fileStorageService;

    public DocumentoService(
            DocumentoRepository documentoRepository,
            PedidoRepository pedidoRepository,
            CursoRepository cursoRepository,
            ConfiguracionRepository configuracionRepository,
            NotificacionService notificacionService,
            EmailService emailService,
            FileStorageService fileStorageService) {
        this.documentoRepository = documentoRepository;
        this.pedidoRepository = pedidoRepository;
        this.cursoRepository = cursoRepository;
        this.configuracionRepository = configuracionRepository;
        this.notificacionService = notificacionService;
        this.emailService = emailService;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public DocumentoResponse crear(Usuario usuario, DocumentoRequest request, MultipartFile archivo) {
        Pedido pedido = null;
        if (request.pedidoId() != null) {
            pedido = pedidoRepository.findById(request.pedidoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado: " + request.pedidoId()));
        }

        Curso curso = null;
        if (request.cursoId() != null) {
            curso = cursoRepository.findById(request.cursoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado: " + request.cursoId()));
        }

        String nombreGuardado = fileStorageService.guardar(archivo, FileStorageService.EXTENSIONES_DOCUMENTO);

        Documento documento = Documento.builder()
                .nombre(request.nombre())
                .formato(request.formato())
                .esDobleFaz(request.esDobleFaz())
                .aColor(request.aColor())
                .descripcion(request.descripcion())
                .esEnvio(request.esEnvio())
                .direccion(request.direccion())
                .materia(request.materia())
                .cantidadCopias(request.cantidadCopias())
                .esPractico(request.esPractico())
                .nroPractico(request.nroPractico())
                .fechaIngreso(LocalDate.now())
                .activo(true)
                .ruta(nombreGuardado)
                .nombreArchivoOriginal(archivo.getOriginalFilename())
                .esImagen(request.esImagen())
                .estado(EstadoDocumento.PENDIENTE)
                .origen(request.esPropio() && usuario.getNivel().isAdmin() ? OrigenDocumento.PROPIO : OrigenDocumento.CLIENTE)
                .precio(BigDecimal.ZERO)
                .usuario(usuario)
                .pedido(pedido)
                .curso(curso)
                .tamanio(request.tamanio() != null ? request.tamanio() : "A4")
                .tipoPapel(request.tipoPapel() != null ? request.tipoPapel() : "75g")
                .modoColor(request.modoColor())
                .paginasPorCara(request.paginasPorCara() != null ? request.paginasPorCara() : "1")
                .orientacion(request.orientacion() != null ? request.orientacion() : "VERTICAL")
                .terminacion(request.terminacion() != null ? request.terminacion() : "NINGUNA")
                .build();

        Documento guardado = documentoRepository.save(documento);
        notificacionService.registrarDocumento(usuario, "Cargó el material " + guardado.getNombre(), guardado.getId());
        emailService.notificarAdmin(
                "Nuevo documento cargado: " + guardado.getNombre(),
                usuario.getNombre() + " cargó el documento \"" + guardado.getNombre() + "\" para imprimir.");
        return DocumentoResponse.from(guardado);
    }

    @Transactional
    public DocumentoResponse solicitarImpresion(Usuario usuario, SolicitarImpresionRequest request) {
        Documento origen = buscarEntidad(request.documentoOrigenId());
        verificarAccesoLectura(origen, usuario);

        Pedido pedido = pedidoRepository.findById(request.pedidoId())
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado: " + request.pedidoId()));
        if (!pedido.getUsuario().getId().equals(usuario.getId())) {
            throw new AccessDeniedException("No tenés acceso a este pedido");
        }
        if (pedido.getEstado() != EstadoPedido.PENDIENTE) {
            throw new ConflictException("Solo se pueden agregar documentos a un pedido pendiente");
        }

        String tamanio = request.tamanio() != null ? request.tamanio() : "A4";
        String tipoPapel = request.tipoPapel() != null ? request.tipoPapel() : "75g";
        String modoColor = request.modoColor();
        String terminacion = request.terminacion() != null ? request.terminacion() : "NINGUNA";
        boolean aColor = modoColor != null ? !"BN".equals(modoColor) : request.aColor();

        BigDecimal precio = calcularPrecio(modoColor, aColor, tamanio, tipoPapel, terminacion, request.cantidadCopias());

        Documento copia = Documento.builder()
                .nombre(origen.getNombre())
                .formato(origen.getFormato())
                .esDobleFaz(request.esDobleFaz())
                .aColor(aColor)
                .descripcion(origen.getDescripcion())
                .esEnvio(pedido.isEsEnvio())
                .direccion(pedido.getDireccion())
                .materia(origen.getMateria())
                .cantidadCopias(request.cantidadCopias())
                .esPractico(origen.isEsPractico())
                .nroPractico(origen.getNroPractico())
                .fechaIngreso(LocalDate.now())
                .activo(true)
                .ruta(origen.getRuta())
                .nombreArchivoOriginal(origen.getNombreArchivoOriginal())
                .esImagen(origen.isEsImagen())
                .estado(EstadoDocumento.PENDIENTE)
                .origen(OrigenDocumento.CLIENTE)
                .precio(precio)
                .usuario(usuario)
                .pedido(pedido)
                .curso(origen.getCurso())
                .tamanio(tamanio)
                .tipoPapel(tipoPapel)
                .modoColor(modoColor)
                .paginasPorCara(request.paginasPorCara() != null ? request.paginasPorCara() : "1")
                .orientacion(request.orientacion() != null ? request.orientacion() : "VERTICAL")
                .terminacion(terminacion)
                .build();

        Documento guardado = documentoRepository.save(copia);

        pedido.setPrecio(pedido.getPrecio().add(precio));
        pedidoRepository.save(pedido);

        notificacionService.registrarDocumento(
                usuario, "Pidió imprimir " + guardado.getNombre() + " en el pedido #" + pedido.getId(), guardado.getId());
        emailService.notificarAdmin(
                "Nueva impresión pedida: " + guardado.getNombre(),
                usuario.getNombre() + " pidió " + request.cantidadCopias() + " copia(s) de \"" + guardado.getNombre()
                        + "\" en el pedido #" + pedido.getId());
        return DocumentoResponse.from(guardado);
    }

    @Transactional(readOnly = true)
    public BigDecimal cotizarImpresion(CotizarImpresionRequest request) {
        boolean aColor = request.modoColor() != null && !"BN".equals(request.modoColor());
        return calcularPrecio(
                request.modoColor(), aColor, request.tamanio(), request.tipoPapel(), request.terminacion(),
                request.cantidadCopias());
    }

    private BigDecimal calcularPrecio(String modoColor, boolean aColor, String tamanio, String tipoPapel, String terminacion, int cantidadCopias) {
        BigDecimal precioColor;
        if (modoColor != null) {
            precioColor = switch (modoColor) {
                case "COLOR_LASER" -> config("ImpresionColorLaser");
                case "COLOR_TINTA" -> config("ImpresionColorTinta");
                default -> config("ImpresionBN");
            };
        } else {
            precioColor = aColor ? config("ImpresionColorLaser") : config("ImpresionBN");
        }

        BigDecimal extraTamanio = switch (tamanio != null ? tamanio : "A4") {
            case "A3" -> config("ImpresionExtraA3");
            case "A5" -> config("ImpresionExtraA5");
            default -> BigDecimal.ZERO;
        };

        BigDecimal extraPapel = switch (tipoPapel != null ? tipoPapel : "75g") {
            case "160g" -> config("ImpresionExtra160g");
            case "200g" -> config("ImpresionExtra200g");
            case "FOTO" -> config("ImpresionExtraFoto");
            default -> BigDecimal.ZERO;
        };

        BigDecimal extraTerminacion = switch (terminacion != null ? terminacion : "NINGUNA") {
            case "ENCUADERNACION" -> config("ImpresionEncuadernacion");
            case "GRAPADO" -> config("ImpresionGrapado");
            case "AGUJEROS" -> config("ImpresionAgujeros");
            default -> BigDecimal.ZERO;
        };

        return precioColor.add(extraTamanio).add(extraPapel)
                .multiply(BigDecimal.valueOf(cantidadCopias))
                .add(extraTerminacion);
    }

    private BigDecimal config(String nombre) {
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
    public DocumentoResponse buscar(Long id, Usuario actor) {
        Documento documento = buscarEntidad(id);
        verificarPropietarioOAdmin(documento, actor);
        return DocumentoResponse.from(documento);
    }

    @Transactional(readOnly = true)
    public ArchivoDescarga obtenerArchivo(Long id, Usuario actor) {
        Documento documento = buscarEntidad(id);
        verificarAccesoLectura(documento, actor);
        Path path = fileStorageService.resolver(documento.getRuta());
        Resource recurso = new FileSystemResource(path);
        if (!recurso.exists()) {
            throw new ResourceNotFoundException("El archivo ya no está disponible en el servidor");
        }
        String nombreOriginal = documento.getNombreArchivoOriginal() != null
                ? documento.getNombreArchivoOriginal()
                : documento.getNombre();
        return new ArchivoDescarga(recurso, nombreOriginal);
    }

    @Transactional(readOnly = true)
    public List<DocumentoResponse> listarPropios(Usuario usuario) {
        return documentoRepository
                .findByActivoTrueAndUsuarioIdAndPedidoIsNullOrderByFechaIngresoDesc(usuario.getId()).stream()
                .map(DocumentoResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DocumentoResponse> listarPorCurso(Long cursoId) {
        return documentoRepository.findByActivoTrueAndCursoIdOrderByFechaIngresoDesc(cursoId).stream()
                .map(DocumentoResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DocumentoResponse> listarTodos() {
        return documentoRepository.findByActivoTrueAndPedidoIsNullOrderByFechaIngresoDesc().stream()
                .map(DocumentoResponse::from)
                .toList();
    }

    @Transactional
    public DocumentoResponse cambiarEstado(Long id, EstadoDocumento nuevoEstado) {
        Documento documento = buscarEntidad(id);
        documento.setEstado(nuevoEstado);
        return DocumentoResponse.from(documentoRepository.save(documento));
    }

    @Transactional
    public void eliminar(Long id, Usuario actor) {
        Documento documento = buscarEntidad(id);
        verificarPropietarioOAdmin(documento, actor);
        documento.setActivo(false);
        documentoRepository.save(documento);
    }

    private Documento buscarEntidad(Long id) {
        return documentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Documento no encontrado: " + id));
    }

    private void verificarPropietarioOAdmin(Documento documento, Usuario actor) {
        boolean esPropietario = documento.getUsuario().getId().equals(actor.getId());
        boolean esAdmin = actor.getNivel().isAdmin();
        if (!esPropietario && !esAdmin) {
            throw new AccessDeniedException("No tenés acceso a este documento");
        }
    }

    private void verificarAccesoLectura(Documento documento, Usuario actor) {
        boolean esPropietario = documento.getUsuario().getId().equals(actor.getId());
        boolean esAdmin = actor.getNivel().isAdmin();
        boolean esMaterialDeCurso = documento.getCurso() != null;
        if (!esPropietario && !esAdmin && !esMaterialDeCurso) {
            throw new AccessDeniedException("No tenés acceso a este documento");
        }
    }
}
