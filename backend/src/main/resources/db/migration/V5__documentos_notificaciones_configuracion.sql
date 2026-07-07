CREATE TABLE documento (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    formato VARCHAR(50),
    es_doble_faz BOOLEAN NOT NULL DEFAULT FALSE,
    a_color BOOLEAN NOT NULL DEFAULT FALSE,
    descripcion VARCHAR(500),
    es_envio BOOLEAN NOT NULL DEFAULT FALSE,
    direccion VARCHAR(300),
    grado_liceal INTEGER,
    es_practico BOOLEAN NOT NULL DEFAULT FALSE,
    nro_practico INTEGER,
    fecha_ingreso DATE NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    ruta VARCHAR(500) NOT NULL,
    es_imagen BOOLEAN NOT NULL DEFAULT FALSE,
    estado VARCHAR(20) NOT NULL,
    usuario_id BIGINT NOT NULL REFERENCES usuario(id),
    pedido_id BIGINT REFERENCES pedido(id)
);

CREATE TABLE notificacion (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    nombre_usuario VARCHAR(200) NOT NULL,
    accion_usuario VARCHAR(300) NOT NULL,
    tipo_notificacion VARCHAR(50) NOT NULL,
    fecha TIMESTAMP NOT NULL,
    documento_id BIGINT
);

CREATE TABLE configuracion (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    valor VARCHAR(500),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);
