package dev.alanbertinat.papeleriagest.service;

import dev.alanbertinat.papeleriagest.domain.Nivel;
import dev.alanbertinat.papeleriagest.domain.Usuario;
import dev.alanbertinat.papeleriagest.exception.ConflictException;
import dev.alanbertinat.papeleriagest.exception.ResourceNotFoundException;
import dev.alanbertinat.papeleriagest.repository.NivelRepository;
import dev.alanbertinat.papeleriagest.repository.UsuarioRepository;
import dev.alanbertinat.papeleriagest.web.dto.NivelResponse;
import dev.alanbertinat.papeleriagest.web.dto.UsuarioResponse;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioAdminService {

    private static final int LIMITE_LISTADO = 1000;

    private final UsuarioRepository usuarioRepository;
    private final NivelRepository nivelRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioAdminService(
            UsuarioRepository usuarioRepository, NivelRepository nivelRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.nivelRepository = nivelRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar() {
        return usuarioRepository.findAll(PageRequest.of(0, LIMITE_LISTADO)).stream()
                .map(UsuarioResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NivelResponse> listarNiveles() {
        return nivelRepository.findAll().stream().map(NivelResponse::from).toList();
    }

    @Transactional
    public UsuarioResponse cambiarNivel(Usuario actor, Long usuarioId, Long nivelId) {
        if (actor.getId().equals(usuarioId)) {
            throw new ConflictException("No podés cambiar tu propio rol");
        }
        Usuario usuario = buscarUsuario(usuarioId);
        Nivel nivel = nivelRepository.findById(nivelId)
                .orElseThrow(() -> new ResourceNotFoundException("Nivel no encontrado: " + nivelId));
        if (usuario.getNivel().isAdmin() && !nivel.isAdmin() && usuarioRepository.countByNivel_AdminTrueAndActivoTrue() <= 1) {
            throw new ConflictException("No podés quitarle el rol de administrador al único admin activo");
        }
        usuario.setNivel(nivel);
        return UsuarioResponse.from(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioResponse cambiarActivo(Usuario actor, Long usuarioId, boolean activo) {
        if (actor.getId().equals(usuarioId)) {
            throw new ConflictException("No podés activar o desactivar tu propia cuenta");
        }
        Usuario usuario = buscarUsuario(usuarioId);
        if (!activo && usuario.getNivel().isAdmin() && usuarioRepository.countByNivel_AdminTrueAndActivoTrue() <= 1) {
            throw new ConflictException("No podés desactivar al único administrador activo");
        }
        usuario.setActivo(activo);
        return UsuarioResponse.from(usuarioRepository.save(usuario));
    }

    @Transactional
    public void resetearPassword(Long usuarioId, String nuevaPassword) {
        Usuario usuario = buscarUsuario(usuarioId);
        usuario.setPasswordHash(passwordEncoder.encode(nuevaPassword));
        usuarioRepository.save(usuario);
    }

    private Usuario buscarUsuario(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + id));
    }
}
