package dev.alanbertinat.papeleriagest.domain;

import dev.alanbertinat.papeleriagest.security.UsuarioPrincipal;
import org.hibernate.envers.RevisionListener;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Graba qué usuario autenticado disparó cada revisión de Envers, para poder saber
 * después quién hizo un cambio cuando hay más de un admin usando el sistema.
 */
public class RevisionListenerImpl implements RevisionListener {

    @Override
    public void newRevision(Object revisionEntity) {
        RevisionInfo revision = (RevisionInfo) revisionEntity;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UsuarioPrincipal principal) {
            revision.setUsuarioId(principal.usuario().getId());
        }
    }
}
