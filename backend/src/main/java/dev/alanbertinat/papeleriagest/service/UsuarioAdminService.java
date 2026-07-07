package dev.alanbertinat.papeleriagest.service;

import dev.alanbertinat.papeleriagest.domain.Nivel;
import dev.alanbertinat.papeleriagest.domain.Usuario;
import dev.alanbertinat.papeleriagest.exception.ResourceNotFoundException;
import dev.alanbertinat.papeleriagest.repository.NivelRepository;
import dev.alanbertinat.papeleriagest.repository.UsuarioRepository;
import dev.alanbertinat.papeleriagest.web.dto.NivelResponse;
import dev.alanbertinat.papeleriagest.web.dto.UsuarioResponse;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioAdminService {

    private final UsuarioRepository usuarioRepository;
    private final NivelRepository nivelRepository;

    public UsuarioAdminService(UsuarioRepository usuarioRepository, NivelRepository nivelRepository) {
        this.usuarioRepository = usuarioRepository;
        this.nivelRepository = nivelRepository;
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar() {
        return usuarioRepository.findAll().stream().map(UsuarioResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<NivelResponse> listarNiveles() {
        return nivelRepository.findAll().stream().map(NivelResponse::from).toList();
    }

    @Transactional
    public UsuarioResponse cambiarNivel(Long usuarioId, Long nivelId) {
        Usuario usuario = buscarUsuario(usuarioId);
        Nivel nivel = nivelRepository.findById(nivelId)
                .orElseThrow(() -> new ResourceNotFoundException("Nivel no encontrado: " + nivelId));
        usuario.setNivel(nivel);
        return UsuarioResponse.from(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioResponse cambiarActivo(Long usuarioId, boolean activo) {
        Usuario usuario = buscarUsuario(usuarioId);
        usuario.setActivo(activo);
        return UsuarioResponse.from(usuarioRepository.save(usuario));
    }

    private Usuario buscarUsuario(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + id));
    }
}
