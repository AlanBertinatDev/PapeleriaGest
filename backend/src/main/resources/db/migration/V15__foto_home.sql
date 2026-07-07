CREATE TABLE foto_home (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    archivo_imagen VARCHAR(255) NOT NULL,
    fecha_carga DATE NOT NULL,
    usuario_id BIGINT NOT NULL REFERENCES usuario(id)
);
