package dev.alanbertinat.papeleriagest.service;

import dev.alanbertinat.papeleriagest.domain.Configuracion;
import dev.alanbertinat.papeleriagest.exception.ConflictException;
import dev.alanbertinat.papeleriagest.exception.ResourceNotFoundException;
import dev.alanbertinat.papeleriagest.repository.ConfiguracionRepository;
import dev.alanbertinat.papeleriagest.web.dto.ConfiguracionRequest;
import dev.alanbertinat.papeleriagest.web.dto.ConfiguracionResponse;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConfiguracionService {

    private static final Set<String> PARAMETROS_NUMERICOS = Set.of(
            "CostoEnvio",
            "ImpresionBN",
            "ImpresionColorLaser",
            "ImpresionColorTinta",
            "ImpresionExtraA3",
            "ImpresionExtraA5",
            "ImpresionExtra160g",
            "ImpresionExtra200g",
            "ImpresionExtraFoto",
            "ImpresionEncuadernacion",
            "ImpresionGrapado",
            "ImpresionAgujeros");

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
        if (PARAMETROS_NUMERICOS.contains(request.nombre())) {
            validarValorNumerico(request.nombre(), request.valor());
        }
        Configuracion configuracion = configuracionRepository.findByNombreAndActivoTrue(request.nombre())
                .orElseGet(() -> Configuracion.builder()
                        .nombre(request.nombre())
                        .activo(true)
                        .build());
        configuracion.setValor(request.valor());
        return ConfiguracionResponse.from(configuracionRepository.save(configuracion));
    }

    private void validarValorNumerico(String nombre, String valor) {
        if (valor == null || valor.isBlank()) {
            throw new ConflictException("El parámetro \"" + nombre + "\" necesita un valor numérico");
        }
        BigDecimal numero;
        try {
            numero = new BigDecimal(valor);
        } catch (NumberFormatException ex) {
            throw new ConflictException("El parámetro \"" + nombre + "\" debe ser un número (ej: 150.00)");
        }
        if (numero.signum() < 0) {
            throw new ConflictException("El parámetro \"" + nombre + "\" no puede ser negativo");
        }
    }

    @Transactional
    public void eliminar(Long id) {
        Configuracion configuracion = configuracionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Configuración no encontrada: " + id));
        configuracion.setActivo(false);
        configuracionRepository.save(configuracion);
    }
}
