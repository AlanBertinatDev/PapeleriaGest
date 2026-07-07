ALTER TABLE nivel ADD COLUMN docente BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE nivel_aud ADD COLUMN docente BOOLEAN;

INSERT INTO nivel (nombre, admin, estandar, docente, activo) VALUES ('Docente', FALSE, FALSE, TRUE, TRUE);
