ALTER TABLE oferta ADD COLUMN tipo VARCHAR(20);
UPDATE oferta SET tipo = 'PRODUCTO';
ALTER TABLE oferta ALTER COLUMN tipo SET NOT NULL;

ALTER TABLE oferta ADD COLUMN imagen_archivo VARCHAR(255);
ALTER TABLE oferta ADD COLUMN notificado BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE oferta ADD COLUMN notificado_cantidad INTEGER;
ALTER TABLE oferta ADD COLUMN audiencia_notificacion VARCHAR(20);

ALTER TABLE oferta_aud ADD COLUMN tipo VARCHAR(20);
ALTER TABLE oferta_aud ADD COLUMN imagen_archivo VARCHAR(255);
ALTER TABLE oferta_aud ADD COLUMN notificado BOOLEAN;
ALTER TABLE oferta_aud ADD COLUMN notificado_cantidad INTEGER;
ALTER TABLE oferta_aud ADD COLUMN audiencia_notificacion VARCHAR(20);

DROP TABLE imagen_aud;
DROP TABLE imagen;
