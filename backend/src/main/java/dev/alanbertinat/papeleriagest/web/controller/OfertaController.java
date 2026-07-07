package dev.alanbertinat.papeleriagest.web.controller;

import dev.alanbertinat.papeleriagest.security.UsuarioPrincipal;
import dev.alanbertinat.papeleriagest.service.ArchivoDescarga;
import dev.alanbertinat.papeleriagest.service.OfertaService;
import dev.alanbertinat.papeleriagest.web.dto.OfertaRequest;
import dev.alanbertinat.papeleriagest.web.dto.OfertaResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/ofertas")
public class OfertaController {

    private final OfertaService ofertaService;

    public OfertaController(OfertaService ofertaService) {
        this.ofertaService = ofertaService;
    }

    @GetMapping
    public List<OfertaResponse> listarVigentes() {
        return ofertaService.listarVigentes();
    }

    @GetMapping("/todas")
    @PreAuthorize("hasRole('ADMIN')")
    public List<OfertaResponse> listarTodas() {
        return ofertaService.listarTodas();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OfertaResponse> crear(
            @AuthenticationPrincipal UsuarioPrincipal principal, @Valid @RequestBody OfertaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ofertaService.crear(principal.usuario(), request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public OfertaResponse actualizar(@PathVariable Long id, @Valid @RequestBody OfertaRequest request) {
        return ofertaService.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        ofertaService.desactivar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/{id}/imagen", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public OfertaResponse actualizarImagen(@PathVariable Long id, @RequestPart("archivo") MultipartFile archivo) {
        return ofertaService.actualizarImagen(id, archivo);
    }

    @GetMapping("/{id}/imagen")
    public ResponseEntity<Resource> obtenerImagen(@PathVariable Long id) {
        ArchivoDescarga archivo = ofertaService.obtenerImagen(id);
        MediaType contentType =
                MediaTypeFactory.getMediaType(archivo.recurso()).orElse(MediaType.APPLICATION_OCTET_STREAM);
        return ResponseEntity.ok().contentType(contentType).body(archivo.recurso());
    }
}
