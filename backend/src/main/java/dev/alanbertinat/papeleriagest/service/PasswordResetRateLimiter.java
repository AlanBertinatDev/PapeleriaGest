package dev.alanbertinat.papeleriagest.service;

import dev.alanbertinat.papeleriagest.exception.TooManyRequestsException;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

/**
 * Limita cuántos emails de "restablecer contraseña" se pueden pedir por dirección,
 * para que no se pueda usar el formulario para bombardear de mails a un tercero.
 */
@Component
public class PasswordResetRateLimiter {

    private static final int MAX_PEDIDOS = 3;
    private static final Duration VENTANA = Duration.ofHours(1);

    private final ConcurrentHashMap<String, Pedidos> pedidosPorEmail = new ConcurrentHashMap<>();

    public void verificarNoBloqueado(String email) {
        Pedidos pedidos = pedidosPorEmail.get(clave(email));
        if (pedidos != null && pedidos.cantidad >= MAX_PEDIDOS
                && Instant.now().isBefore(pedidos.primerPedido.plus(VENTANA))) {
            throw new TooManyRequestsException("Ya pediste el restablecimiento varias veces. Probá de nuevo más tarde.");
        }
    }

    public void registrarPedido(String email) {
        pedidosPorEmail.compute(clave(email), (k, actual) -> {
            if (actual == null || Instant.now().isAfter(actual.primerPedido.plus(VENTANA))) {
                return new Pedidos(1, Instant.now());
            }
            return new Pedidos(actual.cantidad + 1, actual.primerPedido);
        });
    }

    private String clave(String email) {
        return email == null ? "" : email.toLowerCase(Locale.ROOT).trim();
    }

    private record Pedidos(int cantidad, Instant primerPedido) {
    }
}
