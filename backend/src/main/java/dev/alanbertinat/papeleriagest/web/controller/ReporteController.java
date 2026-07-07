package dev.alanbertinat.papeleriagest.web.controller;

import dev.alanbertinat.papeleriagest.service.ReporteService;
import dev.alanbertinat.papeleriagest.web.dto.ProductoMasVendidoResponse;
import dev.alanbertinat.papeleriagest.web.dto.ResumenReporteResponse;
import dev.alanbertinat.papeleriagest.web.dto.UsuarioConteoResponse;
import dev.alanbertinat.papeleriagest.web.dto.UsuarioGastoResponse;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reportes")
@PreAuthorize("hasRole('ADMIN')")
public class ReporteController {

    private final ReporteService reporteService;

    public ReporteController(ReporteService reporteService) {
        this.reporteService = reporteService;
    }

    @GetMapping("/resumen")
    public ResumenReporteResponse resumen(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return reporteService.resumen(desde, hasta);
    }

    @GetMapping("/productos-mas-vendidos")
    public List<ProductoMasVendidoResponse> productosMasVendidos(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return reporteService.productosMasVendidos(desde, hasta);
    }

    @GetMapping("/usuarios-mas-pedidos")
    public List<UsuarioConteoResponse> usuariosConMasPedidos(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return reporteService.usuariosConMasPedidos(desde, hasta);
    }

    @GetMapping("/usuarios-mas-gasto")
    public List<UsuarioGastoResponse> usuariosConMasGasto(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return reporteService.usuariosConMasGasto(desde, hasta);
    }

    @GetMapping("/usuarios-mas-documentos")
    public List<UsuarioConteoResponse> usuariosConMasDocumentos(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return reporteService.usuariosConMasDocumentos(desde, hasta);
    }
}
