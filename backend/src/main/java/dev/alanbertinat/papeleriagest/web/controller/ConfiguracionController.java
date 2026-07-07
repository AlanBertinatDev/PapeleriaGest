package dev.alanbertinat.papeleriagest.web.controller;

import dev.alanbertinat.papeleriagest.service.ConfiguracionService;
import dev.alanbertinat.papeleriagest.web.dto.ConfiguracionRequest;
import dev.alanbertinat.papeleriagest.web.dto.ConfiguracionResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/configuraciones")
@PreAuthorize("hasRole('ADMIN')")
public class ConfiguracionController {

    private final ConfiguracionService configuracionService;

    public ConfiguracionController(ConfiguracionService configuracionService) {
        this.configuracionService = configuracionService;
    }

    @GetMapping
    public List<ConfiguracionResponse> listar() {
        return configuracionService.listar();
    }

    @PutMapping
    public ConfiguracionResponse upsert(@Valid @RequestBody ConfiguracionRequest request) {
        return configuracionService.upsert(request);
    }
}
