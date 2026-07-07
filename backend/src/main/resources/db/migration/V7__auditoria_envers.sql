CREATE SEQUENCE revinfo_seq START WITH 1 INCREMENT BY 50;

CREATE TABLE revinfo (
    rev INTEGER NOT NULL,
    revtstmp BIGINT,
    PRIMARY KEY (rev)
);

CREATE TABLE categoria_producto_aud (
    activo BOOLEAN,
    porcentaje INTEGER,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    id BIGINT NOT NULL,
    nombre VARCHAR(255),
    PRIMARY KEY (rev, id)
);

CREATE TABLE configuracion_aud (
    activo BOOLEAN,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    id BIGINT NOT NULL,
    nombre VARCHAR(255),
    valor VARCHAR(255),
    PRIMARY KEY (rev, id)
);

CREATE TABLE documento_aud (
    a_color BOOLEAN,
    activo BOOLEAN,
    es_doble_faz BOOLEAN,
    es_envio BOOLEAN,
    es_imagen BOOLEAN,
    es_practico BOOLEAN,
    fecha_ingreso DATE,
    grado_liceal INTEGER,
    nro_practico INTEGER,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    id BIGINT NOT NULL,
    pedido_id BIGINT,
    usuario_id BIGINT,
    descripcion VARCHAR(255),
    direccion VARCHAR(255),
    estado VARCHAR(255),
    formato VARCHAR(255),
    nombre VARCHAR(255),
    ruta VARCHAR(255),
    PRIMARY KEY (rev, id)
);

CREATE TABLE imagen_aud (
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    id BIGINT NOT NULL,
    oferta_id BIGINT,
    url VARCHAR(255),
    PRIMARY KEY (rev, id)
);

CREATE TABLE marca_aud (
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    id BIGINT NOT NULL,
    nombre VARCHAR(255),
    PRIMARY KEY (rev, id)
);

CREATE TABLE nivel_aud (
    activo BOOLEAN,
    admin BOOLEAN,
    estandar BOOLEAN,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    id BIGINT NOT NULL,
    nombre VARCHAR(255),
    PRIMARY KEY (rev, id)
);

CREATE TABLE oferta_aud (
    activo BOOLEAN,
    fecha_desde DATE,
    fecha_hasta DATE,
    precio NUMERIC(38, 2),
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    id BIGINT NOT NULL,
    usuario_id BIGINT,
    descripcion VARCHAR(255),
    titulo VARCHAR(255),
    PRIMARY KEY (rev, id)
);

CREATE TABLE pedido_aud (
    activo BOOLEAN,
    es_envio BOOLEAN,
    fecha_entrega DATE,
    precio NUMERIC(38, 2),
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    fecha_pedido TIMESTAMP(6),
    id BIGINT NOT NULL,
    usuario_id BIGINT,
    descripcion VARCHAR(255),
    direccion VARCHAR(255),
    estado VARCHAR(255),
    hora_entrega VARCHAR(255),
    PRIMARY KEY (rev, id)
);

CREATE TABLE pedido_item_aud (
    cantidad INTEGER,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    id BIGINT NOT NULL,
    pedido_id BIGINT,
    producto_id BIGINT,
    PRIMARY KEY (rev, id)
);

CREATE TABLE producto_aud (
    activo BOOLEAN,
    cantidad INTEGER,
    fecha_carga DATE,
    precio_compra NUMERIC(38, 2),
    precio_venta NUMERIC(38, 2),
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    stock_minimo INTEGER,
    categoria_id BIGINT,
    codigo_producto BIGINT NOT NULL,
    marca_id BIGINT,
    iva VARCHAR(255),
    nombre VARCHAR(255),
    unidad_medida VARCHAR(255),
    PRIMARY KEY (rev, codigo_producto)
);

CREATE TABLE usuario_aud (
    activo BOOLEAN,
    nro_carpeta INTEGER,
    recive_ofertas BOOLEAN,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    id BIGINT NOT NULL,
    nivel_id BIGINT,
    cedula VARCHAR(255),
    email VARCHAR(255),
    nombre VARCHAR(255),
    password_hash VARCHAR(255),
    telefono VARCHAR(255),
    PRIMARY KEY (rev, id)
);

ALTER TABLE categoria_producto_aud ADD CONSTRAINT fk_categoria_producto_aud_rev FOREIGN KEY (rev) REFERENCES revinfo;
ALTER TABLE configuracion_aud ADD CONSTRAINT fk_configuracion_aud_rev FOREIGN KEY (rev) REFERENCES revinfo;
ALTER TABLE documento_aud ADD CONSTRAINT fk_documento_aud_rev FOREIGN KEY (rev) REFERENCES revinfo;
ALTER TABLE imagen_aud ADD CONSTRAINT fk_imagen_aud_rev FOREIGN KEY (rev) REFERENCES revinfo;
ALTER TABLE marca_aud ADD CONSTRAINT fk_marca_aud_rev FOREIGN KEY (rev) REFERENCES revinfo;
ALTER TABLE nivel_aud ADD CONSTRAINT fk_nivel_aud_rev FOREIGN KEY (rev) REFERENCES revinfo;
ALTER TABLE oferta_aud ADD CONSTRAINT fk_oferta_aud_rev FOREIGN KEY (rev) REFERENCES revinfo;
ALTER TABLE pedido_aud ADD CONSTRAINT fk_pedido_aud_rev FOREIGN KEY (rev) REFERENCES revinfo;
ALTER TABLE pedido_item_aud ADD CONSTRAINT fk_pedido_item_aud_rev FOREIGN KEY (rev) REFERENCES revinfo;
ALTER TABLE producto_aud ADD CONSTRAINT fk_producto_aud_rev FOREIGN KEY (rev) REFERENCES revinfo;
ALTER TABLE usuario_aud ADD CONSTRAINT fk_usuario_aud_rev FOREIGN KEY (rev) REFERENCES revinfo;
