CREATE TABLE pedido (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fecha_pedido TIMESTAMP NOT NULL,
    fecha_entrega DATE,
    hora_entrega VARCHAR(10),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    es_envio BOOLEAN NOT NULL DEFAULT FALSE,
    direccion VARCHAR(300),
    descripcion VARCHAR(1000),
    estado VARCHAR(20) NOT NULL,
    precio NUMERIC(12, 2) NOT NULL,
    usuario_id BIGINT NOT NULL REFERENCES usuario(id)
);

CREATE TABLE pedido_item (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pedido_id BIGINT NOT NULL REFERENCES pedido(id),
    producto_id BIGINT NOT NULL REFERENCES producto(codigo_producto),
    cantidad INTEGER NOT NULL,
    UNIQUE (pedido_id, producto_id)
);
