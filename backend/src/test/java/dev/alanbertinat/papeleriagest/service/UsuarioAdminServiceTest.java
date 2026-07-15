package dev.alanbertinat.papeleriagest.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import dev.alanbertinat.papeleriagest.domain.Nivel;
import dev.alanbertinat.papeleriagest.domain.Usuario;
import dev.alanbertinat.papeleriagest.exception.ConflictException;
import dev.alanbertinat.papeleriagest.repository.NivelRepository;
import dev.alanbertinat.papeleriagest.repository.UsuarioRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

class UsuarioAdminServiceTest {

    private UsuarioRepository usuarioRepository;
    private NivelRepository nivelRepository;
    private PasswordEncoder passwordEncoder;
    private UsuarioAdminService service;

    private Nivel nivelAdmin;
    private Nivel nivelEstandar;

    @BeforeEach
    void setUp() {
        usuarioRepository = mock(UsuarioRepository.class);
        nivelRepository = mock(NivelRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        service = new UsuarioAdminService(usuarioRepository, nivelRepository, passwordEncoder);

        nivelAdmin = Nivel.builder().id(1L).nombre("Administrador").admin(true).activo(true).build();
        nivelEstandar = Nivel.builder().id(2L).nombre("Estandar").estandar(true).activo(true).build();

        when(usuarioRepository.save(org.mockito.ArgumentMatchers.any(Usuario.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    private Usuario usuarioConNivel(Long id, Nivel nivel) {
        return Usuario.builder().id(id).nombre("Test").email("test@example.com").cedula("cedula").activo(true)
                .nivel(nivel).build();
    }

    @Test
    void noPermiteQuitarleAdminAlUnicoAdminActivo() {
        Usuario actor = usuarioConNivel(1L, nivelAdmin);
        Usuario objetivo = usuarioConNivel(2L, nivelAdmin);
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(objetivo));
        when(nivelRepository.findById(2L)).thenReturn(Optional.of(nivelEstandar));
        when(usuarioRepository.countByNivel_AdminTrueAndActivoTrue()).thenReturn(1L);

        assertThatThrownBy(() -> service.cambiarNivel(actor, 2L, 2L))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void permiteQuitarleAdminSiHayOtrosAdminsActivos() {
        Usuario actor = usuarioConNivel(1L, nivelAdmin);
        Usuario objetivo = usuarioConNivel(2L, nivelAdmin);
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(objetivo));
        when(nivelRepository.findById(2L)).thenReturn(Optional.of(nivelEstandar));
        when(usuarioRepository.countByNivel_AdminTrueAndActivoTrue()).thenReturn(2L);

        var resultado = service.cambiarNivel(actor, 2L, 2L);

        assertThat(resultado.nivel()).isEqualTo("Estandar");
    }

    @Test
    void noPermiteCambiarseElPropioRol() {
        Usuario actor = usuarioConNivel(1L, nivelAdmin);

        assertThatThrownBy(() -> service.cambiarNivel(actor, 1L, 2L))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void noPermiteDesactivarAlUnicoAdminActivo() {
        Usuario actor = usuarioConNivel(1L, nivelAdmin);
        Usuario objetivo = usuarioConNivel(2L, nivelAdmin);
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(objetivo));
        when(usuarioRepository.countByNivel_AdminTrueAndActivoTrue()).thenReturn(1L);

        assertThatThrownBy(() -> service.cambiarActivo(actor, 2L, false))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void permiteDesactivarUnAdminSiHayOtrosAdminsActivos() {
        Usuario actor = usuarioConNivel(1L, nivelAdmin);
        Usuario objetivo = usuarioConNivel(2L, nivelAdmin);
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(objetivo));
        when(usuarioRepository.countByNivel_AdminTrueAndActivoTrue()).thenReturn(2L);

        var resultado = service.cambiarActivo(actor, 2L, false);

        assertThat(resultado.activo()).isFalse();
    }

    @Test
    void noPermiteActivarODesactivarLaPropiaCuenta() {
        Usuario actor = usuarioConNivel(1L, nivelAdmin);

        assertThatThrownBy(() -> service.cambiarActivo(actor, 1L, false))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void resetearPasswordGuardaElHashCodificado() {
        Usuario objetivo = usuarioConNivel(2L, nivelEstandar);
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(objetivo));
        when(passwordEncoder.encode("nuevaPassword123")).thenReturn("hash-codificado");

        service.resetearPassword(2L, "nuevaPassword123");

        assertThat(objetivo.getPasswordHash()).isEqualTo("hash-codificado");
    }
}
