package dev.alanbertinat.papeleriagest.web.controller;

import dev.alanbertinat.papeleriagest.service.ArchivoDescarga;
import dev.alanbertinat.papeleriagest.service.ProductoService;
import dev.alanbertinat.papeleriagest.web.dto.ProductoRequest;
import dev.alanbertinat.papeleriagest.web.dto.ProductoResponse;
import dev.alanbertinat.papeleriagest.web.dto.ReponerStockRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    public List<ProductoResponse> listar(@RequestParam(required = false) Long categoriaId) {
        return productoService.listar(categoriaId);
    }

    @GetMapping("/{codigoProducto}")
    public ProductoResponse buscar(@PathVariable Long codigoProducto) {
        return productoService.buscarResponse(codigoProducto);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductoResponse> crear(@Valid @RequestBody ProductoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productoService.crear(request));
    }

    @PutMapping("/{codigoProducto}")
    @PreAuthorize("hasRole('ADMIN')")
    public ProductoResponse actualizar(
            @PathVariable Long codigoProducto, @Valid @RequestBody ProductoRequest request) {
        return productoService.actualizar(codigoProducto, request);
    }

    @DeleteMapping("/{codigoProducto}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> desactivar(@PathVariable Long codigoProducto) {
        productoService.desactivar(codigoProducto);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/inactivos")
    @PreAuthorize("hasRole('ADMIN')")
    public List<ProductoResponse> listarInactivos() {
        return productoService.listarInactivos();
    }

    @PutMapping("/{codigoProducto}/reactivar")
    @PreAuthorize("hasRole('ADMIN')")
    public ProductoResponse reactivar(@PathVariable Long codigoProducto) {
        return productoService.reactivar(codigoProducto);
    }

    @PutMapping("/{codigoProducto}/reponer-stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ProductoResponse reponerStock(
            @PathVariable Long codigoProducto, @Valid @RequestBody ReponerStockRequest request) {
        return productoService.reponerStock(codigoProducto, request.cantidad());
    }

    @PostMapping(value = "/{codigoProducto}/imagen", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ProductoResponse actualizarImagen(
            @PathVariable Long codigoProducto, @RequestPart("archivo") MultipartFile archivo) {
        return productoService.actualizarImagen(codigoProducto, archivo);
    }

    @GetMapping("/{codigoProducto}/imagen")
    public ResponseEntity<Resource> obtenerImagen(@PathVariable Long codigoProducto) {
        ArchivoDescarga archivo = productoService.obtenerImagen(codigoProducto);
        MediaType contentType = MediaTypeFactory.getMediaType(archivo.recurso()).orElse(MediaType.APPLICATION_OCTET_STREAM);
        return ResponseEntity.ok().contentType(contentType).body(archivo.recurso());
    }
}
