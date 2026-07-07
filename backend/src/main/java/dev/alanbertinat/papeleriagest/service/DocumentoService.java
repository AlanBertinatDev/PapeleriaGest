package dev.alanbertinat.papeleriagest.service;

import dev.alanbertinat.papeleriagest.domain.Curso;
import dev.alanbertinat.papeleriagest.domain.Documento;
import dev.alanbertinat.papeleriagest.domain.EstadoDocumento;
import dev.alanbertinat.papeleriagest.domain.Pedido;
import dev.alanbertinat.papeleriagest.domain.Usuario;
import dev.alanbertinat.papeleriagest.exception.ResourceNotFoundException;
import dev.alanbertinat.papeleriagest.repository.CursoRepository;
import dev.alanbertinat.papeleriagest.repository.DocumentoRepository;
import dev.alanbertinat.papeleriagest.repository.PedidoRepository;
import dev.alanbertinat.papeleriagest.web.dto.DocumentoRequest;
import dev.alanbertinat.papeleriagest.web.dto.DocumentoResponse;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DocumentoService {

    private final DocumentoRepository documentoRepository;
    private final PedidoRepository pedidoRepository;
    private final CursoRepository cursoRepository;
    private final NotificacionService notificacionService;
    private final EmailService emailService;
    private final FileStorageService fileStorageService;

    public DocumentoService(
            DocumentoRepository documentoRepository,
            PedidoRepository pedidoRepository,
            CursoRepository cursoRepository,
            NotificacionService notificacionService,
            EmailService emailService,
            FileStorageService fileStorageService) {
        this.documentoRepository = documentoRepository;
        this.pedidoRepository = pedidoRepository;
        this.cursoRepository = cursoRepository;
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

        String nombreGuardado = fileStorageService.guardar(archivo);

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
                .usuario(usuario)
                .pedido(pedido)
                .curso(curso)
                .build();

        Documento guardado = documentoRepository.save(documento);
        notificacionService.registrarDocumento(usuario, "Cargó el material " + guardado.getNombre(), guardado.getId());
        emailService.notificarAdmin(
                "Nuevo documento cargado: " + guardado.getNombre(),
                usuario.getNombre() + " cargó el documento \"" + guardado.getNombre() + "\" para imprimir.");
        return DocumentoResponse.from(guardado);
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
        return documentoRepository.findByActivoTrueAndUsuarioIdOrderByFechaIngresoDesc(usuario.getId()).stream()
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
        return documentoRepository.findByActivoTrueOrderByFechaIngresoDesc().stream()
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
