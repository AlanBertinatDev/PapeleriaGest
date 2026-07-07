package dev.alanbertinat.papeleriagest.service;

import dev.alanbertinat.papeleriagest.domain.Imagen;
import dev.alanbertinat.papeleriagest.domain.Oferta;
import dev.alanbertinat.papeleriagest.domain.Producto;
import dev.alanbertinat.papeleriagest.domain.Usuario;
import dev.alanbertinat.papeleriagest.exception.ResourceNotFoundException;
import dev.alanbertinat.papeleriagest.repository.OfertaRepository;
import dev.alanbertinat.papeleriagest.repository.ProductoRepository;
import dev.alanbertinat.papeleriagest.web.dto.OfertaRequest;
import dev.alanbertinat.papeleriagest.web.dto.OfertaResponse;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OfertaService {

    private final OfertaRepository ofertaRepository;
    private final ProductoRepository productoRepository;

    public OfertaService(OfertaRepository ofertaRepository, ProductoRepository productoRepository) {
        this.ofertaRepository = ofertaRepository;
        this.productoRepository = productoRepository;
    }

    @Transactional
    public OfertaResponse crear(Usuario usuario, OfertaRequest request) {
        Set<Producto> productos = new HashSet<>();
        for (Long productoId : request.productoIds()) {
            productos.add(productoRepository.findById(productoId)
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + productoId)));
        }

        Oferta oferta = Oferta.builder()
                .titulo(request.titulo())
                .descripcion(request.descripcion())
                .precio(request.precio())
                .fechaDesde(request.fechaDesde())
                .fechaHasta(request.fechaHasta())
                .activo(true)
                .usuario(usuario)
                .productos(productos)
                .build();

        if (request.imagenesUrls() != null) {
            for (String url : request.imagenesUrls()) {
                oferta.getImagenes().add(Imagen.builder().url(url).oferta(oferta).build());
            }
        }

        return OfertaResponse.from(ofertaRepository.save(oferta));
    }

    @Transactional(readOnly = true)
    public List<OfertaResponse> listarVigentes() {
        LocalDate hoy = LocalDate.now();
        return ofertaRepository
                .findByActivoTrueAndFechaDesdeLessThanEqualAndFechaHastaGreaterThanEqualOrderByFechaDesdeDesc(
                        hoy, hoy)
                .stream()
                .map(OfertaResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OfertaResponse> listarTodas() {
        return ofertaRepository.findByActivoTrueOrderByFechaDesdeDesc().stream()
                .map(OfertaResponse::from)
                .toList();
    }

    @Transactional
    public void desactivar(Long id) {
        Oferta oferta = ofertaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Oferta no encontrada: " + id));
        oferta.setActivo(false);
        ofertaRepository.save(oferta);
    }
}
