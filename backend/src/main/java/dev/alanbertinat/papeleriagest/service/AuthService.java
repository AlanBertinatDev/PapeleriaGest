package dev.alanbertinat.papeleriagest.service;

import dev.alanbertinat.papeleriagest.domain.Nivel;
import dev.alanbertinat.papeleriagest.domain.PasswordResetToken;
import dev.alanbertinat.papeleriagest.domain.Usuario;
import dev.alanbertinat.papeleriagest.exception.ConflictException;
import dev.alanbertinat.papeleriagest.repository.NivelRepository;
import dev.alanbertinat.papeleriagest.repository.PasswordResetTokenRepository;
import dev.alanbertinat.papeleriagest.repository.UsuarioRepository;
import dev.alanbertinat.papeleriagest.security.JwtService;
import dev.alanbertinat.papeleriagest.security.UsuarioPrincipal;
import dev.alanbertinat.papeleriagest.web.dto.AuthResponse;
import dev.alanbertinat.papeleriagest.web.dto.ChangePasswordRequest;
import dev.alanbertinat.papeleriagest.web.dto.LoginRequest;
import dev.alanbertinat.papeleriagest.web.dto.RegisterRequest;
import dev.alanbertinat.papeleriagest.web.dto.UpdatePerfilRequest;
import dev.alanbertinat.papeleriagest.web.dto.UsuarioResponse;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final java.time.Duration VALIDEZ_TOKEN_RESET = java.time.Duration.ofMinutes(30);

    private final UsuarioRepository usuarioRepository;
    private final NivelRepository nivelRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final LoginRateLimiter loginRateLimiter;
    private final PasswordResetRateLimiter passwordResetRateLimiter;
    private final EmailService emailService;
    private final String frontendUrl;

    public AuthService(
            UsuarioRepository usuarioRepository,
            NivelRepository nivelRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            LoginRateLimiter loginRateLimiter,
            PasswordResetRateLimiter passwordResetRateLimiter,
            EmailService emailService,
            @Value("${app.frontend-url}") String frontendUrl) {
        this.usuarioRepository = usuarioRepository;
        this.nivelRepository = nivelRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.loginRateLimiter = loginRateLimiter;
        this.passwordResetRateLimiter = passwordResetRateLimiter;
        this.emailService = emailService;
        this.frontendUrl = frontendUrl;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (usuarioRepository.existsByEmail(request.email())) {
            throw new ConflictException("Ya existe un usuario registrado con ese email");
        }
        if (usuarioRepository.existsByCedula(request.cedula())) {
            throw new ConflictException("Ya existe un usuario registrado con esa cédula");
        }

        Nivel nivelEstandar = nivelRepository.findByEstandarTrueAndActivoTrue()
                .orElseThrow(() -> new IllegalStateException("No existe un nivel estándar configurado"));

        Usuario usuario = Usuario.builder()
                .nombre(request.nombre())
                .email(request.email())
                .cedula(request.cedula())
                .telefono(request.telefono())
                .passwordHash(passwordEncoder.encode(request.password()))
                .activo(true)
                .reciveOfertas(false)
                .nivel(nivelEstandar)
                .build();

        usuarioRepository.save(usuario);

        UsuarioPrincipal principal = new UsuarioPrincipal(usuario);
        return new AuthResponse(jwtService.generateToken(principal), UsuarioResponse.from(usuario));
    }

    public AuthResponse login(LoginRequest request) {
        loginRateLimiter.verificarNoBloqueado(request.email());
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        } catch (org.springframework.security.core.AuthenticationException ex) {
            loginRateLimiter.registrarFallo(request.email());
            throw new BadCredentialsException("Credenciales inválidas");
        }

        Usuario usuario = usuarioRepository.findByEmailAndActivoTrue(request.email())
                .orElseThrow(() -> new BadCredentialsException("Credenciales inválidas"));

        loginRateLimiter.registrarExito(request.email());
        UsuarioPrincipal principal = new UsuarioPrincipal(usuario);
        return new AuthResponse(jwtService.generateToken(principal), UsuarioResponse.from(usuario));
    }

    @Transactional
    public UsuarioResponse actualizarPerfil(Usuario usuario, UpdatePerfilRequest request) {
        if (!usuario.getEmail().equalsIgnoreCase(request.email())
                && usuarioRepository.existsByEmail(request.email())) {
            throw new ConflictException("Ya existe un usuario registrado con ese email");
        }
        usuario.setNombre(request.nombre());
        usuario.setEmail(request.email());
        usuario.setTelefono(request.telefono());
        usuarioRepository.save(usuario);
        return UsuarioResponse.from(usuario);
    }

    @Transactional
    public void changePassword(Usuario usuario, ChangePasswordRequest request) {
        if (!passwordEncoder.matches(request.currentPassword(), usuario.getPasswordHash())) {
            throw new BadCredentialsException("La contraseña actual no es correcta");
        }
        usuario.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        usuarioRepository.save(usuario);
    }

    /**
     * No revela si el email existe: siempre responde igual, para no dejar enumerar cuentas.
     * Si el email es válido, manda un link con un token de un solo uso (30 min de validez).
     */
    @Transactional
    public void solicitarResetPassword(String email) {
        passwordResetRateLimiter.verificarNoBloqueado(email);
        passwordResetRateLimiter.registrarPedido(email);

        usuarioRepository.findByEmailAndActivoTrue(email).ifPresent(usuario -> {
            byte[] bytes = new byte[32];
            RANDOM.nextBytes(bytes);
            String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .usuario(usuario)
                    .token(token)
                    .expiraEn(LocalDateTime.now().plus(VALIDEZ_TOKEN_RESET))
                    .usado(false)
                    .build();
            passwordResetTokenRepository.save(resetToken);

            String link = frontendUrl + "/restablecer-password?token=" + token;
            try {
                emailService.notificarCliente(
                        usuario.getEmail(),
                        "Restablecer tu contraseña",
                        "Hola " + usuario.getNombre() + ",\n\n"
                                + "Pediste restablecer tu contraseña. Entrá a este link (válido por 30 minutos):\n"
                                + link + "\n\n"
                                + "Si no fuiste vos, ignorá este mensaje.");
            } catch (Exception ex) {
                log.warn("No se pudo enviar el email de restablecimiento de contraseña: {}", ex.getMessage());
            }
        });
    }

    @Transactional
    public void restablecerPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new ConflictException("El link es inválido o ya expiró"));

        if (resetToken.isUsado() || resetToken.getExpiraEn().isBefore(LocalDateTime.now())) {
            throw new ConflictException("El link es inválido o ya expiró");
        }

        Usuario usuario = resetToken.getUsuario();
        usuario.setPasswordHash(passwordEncoder.encode(newPassword));
        usuarioRepository.save(usuario);

        resetToken.setUsado(true);
        passwordResetTokenRepository.save(resetToken);
    }
}
