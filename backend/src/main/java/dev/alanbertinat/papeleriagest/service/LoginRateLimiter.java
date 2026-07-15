package dev.alanbertinat.papeleriagest.service;

import dev.alanbertinat.papeleriagest.exception.TooManyRequestsException;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

/**
 * Bloquea intentos de login repetidos para el mismo email. Estado en memoria: alcanza
 * porque el backend corre como una única instancia (ver FileStorageService).
 */
@Component
public class LoginRateLimiter {

    private static final int MAX_INTENTOS = 5;
    private static final Duration VENTANA_BLOQUEO = Duration.ofMinutes(5);

    private final ConcurrentHashMap<String, Intentos> intentosPorEmail = new ConcurrentHashMap<>();

    public void verificarNoBloqueado(String email) {
        Intentos intentos = intentosPorEmail.get(clave(email));
        if (intentos != null && intentos.fallos >= MAX_INTENTOS
                && Instant.now().isBefore(intentos.ultimoFallo.plus(VENTANA_BLOQUEO))) {
            throw new TooManyRequestsException(
                    "Demasiados intentos fallidos. Probá de nuevo en unos minutos.");
        }
    }

    public void registrarFallo(String email) {
        intentosPorEmail.compute(clave(email), (k, actual) -> {
            if (actual == null || Instant.now().isAfter(actual.ultimoFallo.plus(VENTANA_BLOQUEO))) {
                return new Intentos(1, Instant.now());
            }
            return new Intentos(actual.fallos + 1, Instant.now());
        });
    }

    public void registrarExito(String email) {
        intentosPorEmail.remove(clave(email));
    }

    private String clave(String email) {
        return email == null ? "" : email.toLowerCase(Locale.ROOT).trim();
    }

    private record Intentos(int fallos, Instant ultimoFallo) {
    }
}
