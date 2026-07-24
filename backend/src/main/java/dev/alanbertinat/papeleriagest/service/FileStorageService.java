package dev.alanbertinat.papeleriagest.service;

import dev.alanbertinat.papeleriagest.exception.ConflictException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Locale;
import java.util.Map;
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

    // Firmas de los primeros bytes de cada formato, para no confiar solo en la extensión del nombre de archivo.
    private static final Map<String, List<byte[]>> FIRMAS = Map.ofEntries(
            Map.entry(".jpg", List.of(new byte[] {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF})),
            Map.entry(".jpeg", List.of(new byte[] {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF})),
            Map.entry(".png", List.of(new byte[] {(byte) 0x89, 0x50, 0x4E, 0x47})),
            Map.entry(".gif", List.of(new byte[] {0x47, 0x49, 0x46, 0x38})),
            Map.entry(".webp", List.of(new byte[] {0x52, 0x49, 0x46, 0x46})),
            Map.entry(".pdf", List.of(new byte[] {0x25, 0x50, 0x44, 0x46})),
            Map.entry(".doc", List.of(new byte[] {(byte) 0xD0, (byte) 0xCF, 0x11, (byte) 0xE0})),
            Map.entry(".xls", List.of(new byte[] {(byte) 0xD0, (byte) 0xCF, 0x11, (byte) 0xE0})),
            Map.entry(".ppt", List.of(new byte[] {(byte) 0xD0, (byte) 0xCF, 0x11, (byte) 0xE0})),
            Map.entry(".docx", List.of(new byte[] {0x50, 0x4B, 0x03, 0x04})),
            Map.entry(".xlsx", List.of(new byte[] {0x50, 0x4B, 0x03, 0x04})),
            Map.entry(".pptx", List.of(new byte[] {0x50, 0x4B, 0x03, 0x04})));

    public String guardar(MultipartFile archivo, Set<String> extensionesPermitidas) {
        String extension = extensionDe(archivo.getOriginalFilename());
        if (!extensionesPermitidas.contains(extension)) {
            throw new ConflictException(
                    "Tipo de archivo no permitido" + (extension.isBlank() ? "" : " (" + extension + ")"));
        }
        if (!firmaValida(archivo, extension)) {
            throw new ConflictException("El contenido del archivo no coincide con la extensión " + extension);
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

    private boolean firmaValida(MultipartFile archivo, String extension) {
        List<byte[]> firmasEsperadas = FIRMAS.get(extension);
        if (firmasEsperadas == null) {
            return true;
        }
        byte[] header = new byte[12];
        int leidos;
        try (InputStream in = archivo.getInputStream()) {
            leidos = in.readNBytes(header, 0, header.length);
        } catch (IOException ex) {
            throw new IllegalStateException("No se pudo leer el archivo adjunto", ex);
        }
        if (".webp".equals(extension)) {
            return leidos >= 12
                    && header[0] == 'R' && header[1] == 'I' && header[2] == 'F' && header[3] == 'F'
                    && header[8] == 'W' && header[9] == 'E' && header[10] == 'B' && header[11] == 'P';
        }
        for (byte[] firma : firmasEsperadas) {
            if (leidos < firma.length) {
                continue;
            }
            boolean coincide = true;
            for (int i = 0; i < firma.length; i++) {
                if (header[i] != firma[i]) {
                    coincide = false;
                    break;
                }
            }
            if (coincide) {
                return true;
            }
        }
        return false;
    }

    private String extensionDe(String nombreOriginal) {
        if (nombreOriginal == null) {
            return "";
        }
        int punto = nombreOriginal.lastIndexOf('.');
        return punto >= 0 ? nombreOriginal.substring(punto).toLowerCase(Locale.ROOT) : "";
    }
}
