package dev.alanbertinat.papeleriagest.service;

import dev.alanbertinat.papeleriagest.domain.FotoHome;
import dev.alanbertinat.papeleriagest.domain.Usuario;
import dev.alanbertinat.papeleriagest.exception.ResourceNotFoundException;
import dev.alanbertinat.papeleriagest.repository.FotoHomeRepository;
import dev.alanbertinat.papeleriagest.web.dto.FotoHomeResponse;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FotoHomeService {

    private final FotoHomeRepository fotoHomeRepository;
    private final FileStorageService fileStorageService;

    public FotoHomeService(FotoHomeRepository fotoHomeRepository, FileStorageService fileStorageService) {
        this.fotoHomeRepository = fotoHomeRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public FotoHomeResponse crear(Usuario usuario, MultipartFile archivo) {
        FotoHome foto = FotoHome.builder()
                .archivoImagen(fileStorageService.guardar(archivo, FileStorageService.EXTENSIONES_IMAGEN))
                .fechaCarga(LocalDate.now())
                .usuario(usuario)
                .build();
        return FotoHomeResponse.from(fotoHomeRepository.save(foto));
    }

    @Transactional(readOnly = true)
    public List<FotoHomeResponse> listar() {
        return fotoHomeRepository.findAllByOrderByFechaCargaDesc().stream()
                .map(FotoHomeResponse::from)
                .toList();
    }

    @Transactional
    public void eliminar(Long id) {
        if (!fotoHomeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Foto no encontrada: " + id);
        }
        fotoHomeRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public ArchivoDescarga obtenerImagen(Long id) {
        FotoHome foto = fotoHomeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Foto no encontrada: " + id));
        Path path = fileStorageService.resolver(foto.getArchivoImagen());
        Resource recurso = new FileSystemResource(path);
        if (!recurso.exists()) {
            throw new ResourceNotFoundException("La imagen ya no está disponible en el servidor");
        }
        return new ArchivoDescarga(recurso, foto.getArchivoImagen());
    }
}
