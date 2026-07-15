package dev.alanbertinat.papeleriagest.service;

import dev.alanbertinat.papeleriagest.exception.ConflictException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Guarda los archivos adjuntos en el disco de la máquina donde corre el backend
 * (la PC de la papelería), en vez de en un storage en la nube, porque así es
 * donde se decidió correr el backend en producción.
 */
@Service
public class FileStorageService {

    public static final Set<String> EXTENSIONES_IMAGEN = Set.of(".jpg", ".jpeg", ".png", ".gif", ".webp");
    public static final Set<String> EXTENSIONES_DOCUMENTO = Set.of(
            ".jpg", ".jpeg", ".png", ".gif", ".webp",
            ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx");

    private final Path baseDir;

    public FileStorageService(@Value("${app.storage.path}") String storagePath) {
        this.baseDir = Paths.get(storagePath).toAbsolutePath().normalize();
        try {
            Files.createDirectories(baseDir);
        } catch (IOException ex) {
            throw new IllegalStateException("No se pudo crear el directorio de almacenamiento: " + baseDir, ex);
        }
    }

    public String guardar(MultipartFile archivo, Set<String> extensionesPermitidas) {
        String extension = extensionDe(archivo.getOriginalFilename());
        if (!extensionesPermitidas.contains(extension)) {
            throw new ConflictException(
                    "Tipo de archivo no permitido" + (extension.isBlank() ? "" : " (" + extension + ")"));
        }
        String nombreGuardado = UUID.randomUUID() + extension;
        Path destino = baseDir.resolve(nombreGuardado);
        try (InputStream in = archivo.getInputStream()) {
            Files.copy(in, destino, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new IllegalStateException("No se pudo guardar el archivo adjunto", ex);
        }
        return nombreGuardado;
    }

    public Path resolver(String nombreGuardado) {
        Path resuelto = baseDir.resolve(nombreGuardado).normalize();
        if (!resuelto.startsWith(baseDir)) {
            throw new IllegalArgumentException("Nombre de archivo inválido");
        }
        return resuelto;
    }

    private String extensionDe(String nombreOriginal) {
        if (nombreOriginal == null) {
            return "";
        }
        int punto = nombreOriginal.lastIndexOf('.');
        return punto >= 0 ? nombreOriginal.substring(punto).toLowerCase(Locale.ROOT) : "";
    }
}
