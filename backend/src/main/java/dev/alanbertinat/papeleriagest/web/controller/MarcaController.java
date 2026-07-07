package dev.alanbertinat.papeleriagest.web.controller;

import dev.alanbertinat.papeleriagest.domain.Marca;
import dev.alanbertinat.papeleriagest.repository.MarcaRepository;
import dev.alanbertinat.papeleriagest.web.dto.MarcaRequest;
import dev.alanbertinat.papeleriagest.web.dto.MarcaResponse;
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
@RequestMapping("/api/marcas")
public class MarcaController {

    private final MarcaRepository marcaRepository;

    public MarcaController(MarcaRepository marcaRepository) {
        this.marcaRepository = marcaRepository;
    }

    @GetMapping
    public List<MarcaResponse> listar() {
        return marcaRepository.findAll().stream().map(MarcaResponse::from).toList();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MarcaResponse> crear(@Valid @RequestBody MarcaRequest request) {
        Marca marca = Marca.builder().nombre(request.nombre()).build();
        return ResponseEntity.status(HttpStatus.CREATED).body(MarcaResponse.from(marcaRepository.save(marca)));
    }
}
