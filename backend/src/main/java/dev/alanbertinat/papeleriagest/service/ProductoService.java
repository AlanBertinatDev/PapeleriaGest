package dev.alanbertinat.papeleriagest.service;

import dev.alanbertinat.papeleriagest.domain.CategoriaProducto;
import dev.alanbertinat.papeleriagest.domain.Marca;
import dev.alanbertinat.papeleriagest.domain.Producto;
import dev.alanbertinat.papeleriagest.exception.ConflictException;
import dev.alanbertinat.papeleriagest.exception.ResourceNotFoundException;
import dev.alanbertinat.papeleriagest.repository.CategoriaProductoRepository;
import dev.alanbertinat.papeleriagest.repository.MarcaRepository;
import dev.alanbertinat.papeleriagest.repository.ProductoRepository;
import dev.alanbertinat.papeleriagest.web.dto.ProductoRequest;
import dev.alanbertinat.papeleriagest.web.dto.ProductoResponse;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaProductoRepository categoriaProductoRepository;
    private final MarcaRepository marcaRepository;
    private final FileStorageService fileStorageService;

    public ProductoService(
            ProductoRepository productoRepository,
            CategoriaProductoRepository categoriaProductoRepository,
            MarcaRepository marcaRepository,
            FileStorageService fileStorageService) {
        this.productoRepository = productoRepository;
        this.categoriaProductoRepository = categoriaProductoRepository;
        this.marcaRepository = marcaRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional(readOnly = true)
    public List<ProductoResponse> listar(Long categoriaId) {
        List<Producto> productos = categoriaId != null
                ? productoRepository.findByActivoTrueAndCategoriaIdOrderByCodigoProducto(categoriaId)
                : productoRepository.findByActivoTrueOrderByCodigoProducto();
        return productos.stream().map(ProductoResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public ProductoResponse buscarResponse(Long codigoProducto) {
        return ProductoResponse.from(buscar(codigoProducto));
    }

    private Producto buscar(Long codigoProducto) {
        return productoRepository.findById(codigoProducto)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + codigoProducto));
    }

    @Transactional
    public ProductoResponse crear(ProductoRequest request) {
        if (productoRepository.existsById(request.codigoProducto())) {
            throw new ConflictException("Ya existe un producto con ese código: " + request.codigoProducto());
        }
        CategoriaProducto categoria = buscarCategoria(request.categoriaId());
        Marca marca = buscarMarca(request.marcaId());

        Producto producto = Producto.builder()
                .codigoProducto(request.codigoProducto())
                .nombre(request.nombre())
                .precioVenta(request.precioVenta())
                .precioCompra(request.precioCompra())
                .activo(true)
                .categoria(categoria)
                .marca(marca)
                .cantidad(request.cantidad())
                .unidadMedida(request.unidadMedida())
                .fechaCarga(LocalDate.now())
                .iva(request.iva())
                .stockMinimo(request.stockMinimo())
                .build();

        return ProductoResponse.from(productoRepository.save(producto));
    }

    @Transactional
    public ProductoResponse actualizar(Long codigoProducto, ProductoRequest request) {
        Producto producto = buscar(codigoProducto);
        producto.setNombre(request.nombre());
        producto.setPrecioVenta(request.precioVenta());
        producto.setPrecioCompra(request.precioCompra());
        producto.setCategoria(buscarCategoria(request.categoriaId()));
        producto.setMarca(buscarMarca(request.marcaId()));
        producto.setCantidad(request.cantidad());
        producto.setUnidadMedida(request.unidadMedida());
        producto.setIva(request.iva());
        producto.setStockMinimo(request.stockMinimo());
        return ProductoResponse.from(productoRepository.save(producto));
    }

    @Transactional
    public void desactivar(Long codigoProducto) {
        Producto producto = buscar(codigoProducto);
        producto.setActivo(false);
        productoRepository.save(producto);
    }

    @Transactional
    public ProductoResponse reactivar(Long codigoProducto) {
        Producto producto = buscar(codigoProducto);
        producto.setActivo(true);
        return ProductoResponse.from(productoRepository.save(producto));
    }

    @Transactional(readOnly = true)
    public List<ProductoResponse> listarInactivos() {
        return productoRepository.findByActivoFalseOrderByCodigoProducto().stream()
                .map(ProductoResponse::from)
                .toList();
    }

    @Transactional
    public ProductoResponse reponerStock(Long codigoProducto, int cantidadASumar) {
        if (cantidadASumar <= 0) {
            throw new ConflictException("La cantidad a reponer debe ser mayor a cero");
        }
        Producto producto = buscar(codigoProducto);
        producto.setCantidad(producto.getCantidad() + cantidadASumar);
        return ProductoResponse.from(productoRepository.save(producto));
    }

    @Transactional
    public ProductoResponse actualizarImagen(Long codigoProducto, MultipartFile archivo) {
        Producto producto = buscar(codigoProducto);
        producto.setImagenArchivo(fileStorageService.guardar(archivo));
        return ProductoResponse.from(productoRepository.save(producto));
    }

    @Transactional(readOnly = true)
    public ArchivoDescarga obtenerImagen(Long codigoProducto) {
        Producto producto = buscar(codigoProducto);
        if (producto.getImagenArchivo() == null) {
            throw new ResourceNotFoundException("El producto no tiene imagen");
        }
        Path path = fileStorageService.resolver(producto.getImagenArchivo());
        Resource recurso = new FileSystemResource(path);
        if (!recurso.exists()) {
            throw new ResourceNotFoundException("La imagen ya no está disponible en el servidor");
        }
        return new ArchivoDescarga(recurso, producto.getImagenArchivo());
    }

    private CategoriaProducto buscarCategoria(Long categoriaId) {
        return categoriaProductoRepository.findById(categoriaId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada: " + categoriaId));
    }

    private Marca buscarMarca(Long marcaId) {
        if (marcaId == null) {
            return null;
        }
        return marcaRepository.findById(marcaId)
                .orElseThrow(() -> new ResourceNotFoundException("Marca no encontrada: " + marcaId));
    }
}
