CREATE TABLE categoria_producto (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    porcentaje INTEGER NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE marca (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE producto (
    codigo_producto BIGINT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    precio_venta NUMERIC(12, 2) NOT NULL,
    precio_compra NUMERIC(12, 2) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    categoria_id BIGINT NOT NULL REFERENCES categoria_producto(id),
    marca_id BIGINT REFERENCES marca(id),
    cantidad INTEGER NOT NULL DEFAULT 0,
    unidad_medida VARCHAR(50),
    fecha_carga DATE NOT NULL DEFAULT CURRENT_DATE,
    iva VARCHAR(20),
    stock_minimo INTEGER NOT NULL DEFAULT 0
);
