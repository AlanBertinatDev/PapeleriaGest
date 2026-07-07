package dev.alanbertinat.papeleriagest.web.controller;

import dev.alanbertinat.papeleriagest.domain.CategoriaProducto;
import dev.alanbertinat.papeleriagest.repository.CategoriaProductoRepository;
import dev.alanbertinat.papeleriagest.web.dto.CategoriaProductoRequest;
import dev.alanbertinat.papeleriagest.web.dto.CategoriaProductoResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaProductoController {

    private final CategoriaProductoRepository categoriaProductoRepository;

    public CategoriaProductoController(CategoriaProductoRepository categoriaProductoRepository) {
        this.categoriaProductoRepository = categoriaProductoRepository;
    }

    @GetMapping
    public List<CategoriaProductoResponse> listar() {
        return categoriaProductoRepository.findByActivoTrue().stream()
                .map(CategoriaProductoResponse::from)
                .toList();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoriaProductoResponse> crear(@Valid @RequestBody CategoriaProductoRequest request) {
        CategoriaProducto categoria = CategoriaProducto.builder()
                .nombre(request.nombre())
                .porcentaje(request.porcentaje())
                .activo(true)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CategoriaProductoResponse.from(categoriaProductoRepository.save(categoria)));
    }
}
