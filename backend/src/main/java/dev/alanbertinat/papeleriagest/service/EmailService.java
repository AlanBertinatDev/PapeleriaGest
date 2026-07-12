package dev.alanbertinat.papeleriagest.service;

import dev.alanbertinat.papeleriagest.repository.ConfiguracionRepository;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import java.util.List;
import java.util.Properties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Envía notificaciones por email usando credenciales cargadas en Configuracion
 * (CorreoEmpresa, Contraseñamail, CorreoAdmin) en vez de fijas en el deploy,
 * ya que la dueña las administra desde la pantalla de Configuración.
 * Si falta alguna, la notificación se omite sin romper el flujo que la disparó.
 * CorreoAdmin admite varias direcciones separadas por coma.
 * notificarClientesOferta manda un único email con los clientes en BCC (no expone
 * direcciones entre ellos) usando las mismas credenciales de CorreoEmpresa/Contraseñamail.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final ConfiguracionRepository configuracionRepository;
    private final String host;
    private final int port;

    public EmailService(
            ConfiguracionRepository configuracionRepository,
            @Value("${app.mail.host}") String host,
            @Value("${app.mail.port}") int port) {
        this.configuracionRepository = configuracionRepository;
        this.host = host;
        this.port = port;
    }

    @Transactional(readOnly = true)
    public void notificarAdmin(String asunto, String cuerpo) {
        String correoEmpresa = valorConfiguracion("CorreoEmpresa");
        String contrasenia = valorConfiguracion("Contraseñamail");
        String correoAdmin = valorConfiguracion("CorreoAdmin");

        if (correoEmpresa == null || contrasenia == null || correoAdmin == null) {
            log.debug("Notificación por email omitida: falta configurar CorreoEmpresa/Contraseñamail/CorreoAdmin");
            return;
        }

        try {
            JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
            mailSender.setHost(host);
            mailSender.setPort(port);
            mailSender.setUsername(correoEmpresa);
            mailSender.setPassword(contrasenia);

            Properties props = mailSender.getJavaMailProperties();
            props.put("mail.transport.protocol", "smtp");
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.starttls.enable", "true");

            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje);
            helper.setFrom(correoEmpresa);
            helper.setTo(InternetAddress.parse(correoAdmin));
            helper.setSubject(asunto);
            helper.setText(cuerpo);

            mailSender.send(mensaje);
        } catch (Exception ex) {
            log.warn("No se pudo enviar el email de notificación: {}", ex.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public void notificarCliente(String destinatario, String asunto, String cuerpo) {
        String correoEmpresa = valorConfiguracion("CorreoEmpresa");
        String contrasenia = valorConfiguracion("Contraseñamail");

        if (correoEmpresa == null || contrasenia == null || destinatario == null || destinatario.isBlank()) {
            log.debug("Notificación al cliente omitida: falta configurar CorreoEmpresa/Contraseñamail o destinatario");
            return;
        }

        try {
            JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
            mailSender.setHost(host);
            mailSender.setPort(port);
            mailSender.setUsername(correoEmpresa);
            mailSender.setPassword(contrasenia);

            Properties props = mailSender.getJavaMailProperties();
            props.put("mail.transport.protocol", "smtp");
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.starttls.enable", "true");

            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje);
            helper.setFrom(correoEmpresa);
            helper.setTo(InternetAddress.parse(destinatario));
            helper.setSubject(asunto);
            helper.setText(cuerpo);

            mailSender.send(mensaje);
        } catch (Exception ex) {
            log.warn("No se pudo enviar el email al cliente: {}", ex.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public void notificarClientesOferta(String tituloOferta, String cuerpo, List<String> destinatariosBcc) {
        if (destinatariosBcc.isEmpty()) {
            return;
        }
        String correoEmpresa = valorConfiguracion("CorreoEmpresa");
        String contrasenia = valorConfiguracion("Contraseñamail");

        if (correoEmpresa == null || contrasenia == null) {
            log.debug("Notificación de oferta omitida: falta configurar CorreoEmpresa/Contraseñamail");
            return;
        }

        try {
            JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
            mailSender.setHost(host);
            mailSender.setPort(port);
            mailSender.setUsername(correoEmpresa);
            mailSender.setPassword(contrasenia);

            Properties props = mailSender.getJavaMailProperties();
            props.put("mail.transport.protocol", "smtp");
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.starttls.enable", "true");

            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje);
            helper.setFrom(correoEmpresa);
            helper.setTo(correoEmpresa);
            helper.setBcc(InternetAddress.parse(String.join(",", destinatariosBcc)));
            helper.setSubject("Nueva oferta: " + tituloOferta);
            helper.setText(cuerpo);

            mailSender.send(mensaje);
        } catch (Exception ex) {
            log.warn("No se pudo enviar el email de oferta: {}", ex.getMessage());
        }
    }

    private String valorConfiguracion(String nombre) {
        return configuracionRepository.findByNombreAndActivoTrue(nombre)
                .map(dev.alanbertinat.papeleriagest.domain.Configuracion::getValor)
                .filter(v -> v != null && !v.isBlank())
                .orElse(null);
    }
}
