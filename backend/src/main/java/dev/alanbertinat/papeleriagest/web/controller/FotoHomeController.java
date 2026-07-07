package dev.alanbertinat.papeleriagest.web.controller;

import dev.alanbertinat.papeleriagest.security.UsuarioPrincipal;
import dev.alanbertinat.papeleriagest.service.ArchivoDescarga;
import dev.alanbertinat.papeleriagest.service.FotoHomeService;
import dev.alanbertinat.papeleriagest.web.dto.FotoHomeResponse;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/fotos-home")
public class FotoHomeController {

    private final FotoHomeService fotoHomeService;

    public FotoHomeController(FotoHomeService fotoHomeService) {
        this.fotoHomeService = fotoHomeService;
    }

    @GetMapping
    public List<FotoHomeResponse> listar() {
        return fotoHomeService.listar();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FotoHomeResponse> crear(
            @AuthenticationPrincipal UsuarioPrincipal principal, @RequestPart("archivo") MultipartFile archivo) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(fotoHomeService.crear(principal.usuario(), archivo));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        fotoHomeService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/imagen")
    public ResponseEntity<Resource> obtenerImagen(@PathVariable Long id) {
        ArchivoDescarga archivo = fotoHomeService.obtenerImagen(id);
        MediaType contentType =
                MediaTypeFactory.getMediaType(archivo.recurso()).orElse(MediaType.APPLICATION_OCTET_STREAM);
        return ResponseEntity.ok().contentType(contentType).body(archivo.recurso());
    }
}
