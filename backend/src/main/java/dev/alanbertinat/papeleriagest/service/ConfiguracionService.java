package dev.alanbertinat.papeleriagest.service;

import dev.alanbertinat.papeleriagest.domain.Configuracion;
import dev.alanbertinat.papeleriagest.exception.ResourceNotFoundException;
import dev.alanbertinat.papeleriagest.repository.ConfiguracionRepository;
import dev.alanbertinat.papeleriagest.web.dto.ConfiguracionRequest;
import dev.alanbertinat.papeleriagest.web.dto.ConfiguracionResponse;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConfiguracionService {

    private final ConfiguracionRepository configuracionRepository;

    public ConfiguracionService(ConfiguracionRepository configuracionRepository) {
        this.configuracionRepository = configuracionRepository;
    }

    @Transactional(readOnly = true)
    public List<ConfiguracionResponse> listar() {
        return configuracionRepository.findByActivoTrue().stream().map(ConfiguracionResponse::from).toList();
    }

    @Transactional
    public ConfiguracionResponse upsert(ConfiguracionRequest request) {
        Configuracion configuracion = configuracionRepository.findByNombreAndActivoTrue(request.nombre())
                .orElseGet(() -> Configuracion.builder()
                        .nombre(request.nombre())
                        .activo(true)
                        .build());
        configuracion.setValor(request.valor());
        return ConfiguracionResponse.from(configuracionRepository.save(configuracion));
    }

    @Transactional
    public void eliminar(Long id) {
        Configuracion configuracion = configuracionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Configuración no encontrada: " + id));
        configuracion.setActivo(false);
        configuracionRepository.save(configuracion);
    }
}
