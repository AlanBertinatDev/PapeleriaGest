package dev.alanbertinat.papeleriagest.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import org.hibernate.envers.Audited;
import org.hibernate.envers.RelationTargetAuditMode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Audited
@Table(name = "documento")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Documento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    private String formato;

    private boolean esDobleFaz;

    private boolean aColor;

    private String descripcion;

    private boolean esEnvio;

    private String direccion;

    private String materia;

    private int cantidadCopias;

    private boolean esPractico;

    private int nroPractico;

    private LocalDate fechaIngreso;

    private boolean activo;

    private String ruta;

    private String nombreArchivoOriginal;

    private boolean esImagen;

    @Enumerated(EnumType.STRING)
    private EstadoDocumento estado;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pedido_id")
    private Pedido pedido;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "curso_id")
    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    private Curso curso;
}
