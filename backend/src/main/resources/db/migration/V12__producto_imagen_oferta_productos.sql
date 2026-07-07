ALTER TABLE producto ADD COLUMN imagen_archivo VARCHAR(255);
ALTER TABLE producto_aud ADD COLUMN imagen_archivo VARCHAR(255);

CREATE TABLE oferta_producto (
    oferta_id BIGINT NOT NULL REFERENCES oferta(id),
    producto_id BIGINT NOT NULL REFERENCES producto(codigo_producto),
    PRIMARY KEY (oferta_id, producto_id)
);
