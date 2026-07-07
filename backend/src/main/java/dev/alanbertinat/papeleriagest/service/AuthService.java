package dev.alanbertinat.papeleriagest.service;

import dev.alanbertinat.papeleriagest.domain.Nivel;
import dev.alanbertinat.papeleriagest.domain.Usuario;
import dev.alanbertinat.papeleriagest.exception.ConflictException;
import dev.alanbertinat.papeleriagest.repository.NivelRepository;
import dev.alanbertinat.papeleriagest.repository.UsuarioRepository;
import dev.alanbertinat.papeleriagest.security.JwtService;
import dev.alanbertinat.papeleriagest.security.UsuarioPrincipal;
import dev.alanbertinat.papeleriagest.web.dto.AuthResponse;
import dev.alanbertinat.papeleriagest.web.dto.ChangePasswordRequest;
import dev.alanbertinat.papeleriagest.web.dto.LoginRequest;
import dev.alanbertinat.papeleriagest.web.dto.RegisterRequest;
import dev.alanbertinat.papeleriagest.web.dto.UsuarioResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final NivelRepository nivelRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UsuarioRepository usuarioRepository,
            NivelRepository nivelRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.nivelRepository = nivelRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
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
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        } catch (org.springframework.security.core.AuthenticationException ex) {
            throw new BadCredentialsException("Credenciales inválidas");
        }

        Usuario usuario = usuarioRepository.findByEmailAndActivoTrue(request.email())
                .orElseThrow(() -> new BadCredentialsException("Credenciales inválidas"));

        UsuarioPrincipal principal = new UsuarioPrincipal(usuario);
        return new AuthResponse(jwtService.generateToken(principal), UsuarioResponse.from(usuario));
    }

    @Transactional
    public void changePassword(Usuario usuario, ChangePasswordRequest request) {
        if (!passwordEncoder.matches(request.currentPassword(), usuario.getPasswordHash())) {
            throw new BadCredentialsException("La contraseña actual no es correcta");
        }
        usuario.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        usuarioRepository.save(usuario);
    }
}
