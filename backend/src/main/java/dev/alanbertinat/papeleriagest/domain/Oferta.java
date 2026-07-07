package dev.alanbertinat.papeleriagest.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Audited
@Table(name = "oferta")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Oferta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;

    private String descripcion;

    private BigDecimal precio;

    private LocalDate fechaDesde;

    private LocalDate fechaHasta;

    private boolean activo;

    @Enumerated(EnumType.STRING)
    private TipoOferta tipo;

    private String imagenArchivo;

    private boolean notificado;

    private boolean destacarHome;

    private Integer notificadoCantidad;

    @Enumerated(EnumType.STRING)
    private AudienciaNotificacion audienciaNotificacion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Builder.Default
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "oferta_producto",
            joinColumns = @JoinColumn(name = "oferta_id"),
            inverseJoinColumns = @JoinColumn(name = "producto_id"))
    @NotAudited
    private Set<Producto> productos = new HashSet<>();
}
