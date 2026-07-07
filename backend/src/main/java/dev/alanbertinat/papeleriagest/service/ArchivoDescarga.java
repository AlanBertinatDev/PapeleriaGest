package dev.alanbertinat.papeleriagest.service;

import org.springframework.core.io.Resource;

public record ArchivoDescarga(Resource recurso, String nombreOriginal) {
}
