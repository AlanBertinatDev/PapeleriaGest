package dev.alanbertinat.papeleriagest.security;

import dev.alanbertinat.papeleriagest.domain.Usuario;
import java.util.Collection;
import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public record UsuarioPrincipal(Usuario usuario) implements UserDetails {

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (usuario.getNivel().isAdmin()) {
            return List.of(new SimpleGrantedAuthority("ROLE_ADMIN"));
        }
        if (usuario.getNivel().isDocente()) {
            return List.of(new SimpleGrantedAuthority("ROLE_DOCENTE"));
        }
        return List.of(new SimpleGrantedAuthority("ROLE_ESTANDAR"));
    }

    @Override
    public String getPassword() {
        return usuario.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return usuario.getEmail();
    }

    @Override
    public boolean isEnabled() {
        return usuario.isActivo();
    }
}
