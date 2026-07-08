package dev.alanbertinat.papeleriagest.web.controller;

import dev.alanbertinat.papeleriagest.security.UsuarioPrincipal;
import dev.alanbertinat.papeleriagest.service.ArchivoDescarga;
import dev.alanbertinat.papeleriagest.service.DocumentoService;
import dev.alanbertinat.papeleriagest.web.dto.CambiarEstadoDocumentoRequest;
import dev.alanbertinat.papeleriagest.web.dto.CotizacionImpresionResponse;
import dev.alanbertinat.papeleriagest.web.dto.CotizarImpresionRequest;
import dev.alanbertinat.papeleriagest.web.dto.DocumentoRequest;
import dev.alanbertinat.papeleriagest.web.dto.DocumentoResponse;
import dev.alanbertinat.papeleriagest.web.dto.SolicitarImpresionRequest;
import jakarta.validation.Valid;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/documentos")
public class DocumentoController {

    private final DocumentoService documentoService;

    public DocumentoController(DocumentoService documentoService) {
        this.documentoService = documentoService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentoResponse> crear(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @Valid @ModelAttribute DocumentoRequest request,
            @RequestPart("archivo") MultipartFile archivo) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(documentoService.crear(principal.usuario(), request, archivo));
    }

    @PostMapping("/solicitar-impresion")
    public ResponseEntity<DocumentoResponse> solicitarImpresion(
            @AuthenticationPrincipal UsuarioPrincipal principal, @Valid @RequestBody SolicitarImpresionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(documentoService.solicitarImpresion(principal.usuario(), request));
    }

    @PostMapping("/cotizar")
    public CotizacionImpresionResponse cotizar(@Valid @RequestBody CotizarImpresionRequest request) {
        return new CotizacionImpresionResponse(documentoService.cotizarImpresion(request));
    }

    @GetMapping("/mios")
    public List<DocumentoResponse> listarPropios(@AuthenticationPrincipal UsuarioPrincipal principal) {
        return documentoService.listarPropios(principal.usuario());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<DocumentoResponse> listarTodos() {
        return documentoService.listarTodos();
    }

    @GetMapping("/por-curso/{cursoId}")
    public List<DocumentoResponse> listarPorCurso(@PathVariable Long cursoId) {
        return documentoService.listarPorCurso(cursoId);
    }

    @GetMapping("/{id}")
    public DocumentoResponse buscar(@AuthenticationPrincipal UsuarioPrincipal principal, @PathVariable Long id) {
        return documentoService.buscar(id, principal.usuario());
    }

    @GetMapping("/{id}/archivo")
    public ResponseEntity<Resource> descargarArchivo(
            @AuthenticationPrincipal UsuarioPrincipal principal, @PathVariable Long id) {
        ArchivoDescarga archivo = documentoService.obtenerArchivo(id, principal.usuario());
        String nombreCodificado = java.net.URLEncoder.encode(archivo.nombreOriginal(), StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + nombreCodificado)
                .body(archivo.recurso());
    }

    @PutMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMIN')")
    public DocumentoResponse cambiarEstado(
            @PathVariable Long id, @Valid @RequestBody CambiarEstadoDocumentoRequest request) {
        return documentoService.cambiarEstado(id, request.estado());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@AuthenticationPrincipal UsuarioPrincipal principal, @PathVariable Long id) {
        documentoService.eliminar(id, principal.usuario());
        return ResponseEntity.noContent().build();
    }
}
