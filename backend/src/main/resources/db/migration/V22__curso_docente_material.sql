ALTER TABLE curso ADD CONSTRAINT curso_grado_check CHECK (grado IN ('1', '2', '3', '4', '5', '6'));
ALTER TABLE curso ADD CONSTRAINT curso_grado_grupo_unique UNIQUE (grado, grupo);

ALTER TABLE documento ADD COLUMN codigo VARCHAR(20);
ALTER TABLE documento_aud ADD COLUMN codigo VARCHAR(20);
