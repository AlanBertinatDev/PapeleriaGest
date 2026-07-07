ALTER TABLE documento DROP COLUMN grado_liceal;
ALTER TABLE documento ADD COLUMN materia VARCHAR(100);
ALTER TABLE documento ADD COLUMN cantidad_copias INTEGER NOT NULL DEFAULT 1;
ALTER TABLE documento ADD COLUMN curso_id BIGINT REFERENCES curso(id);

ALTER TABLE documento_aud DROP COLUMN grado_liceal;
ALTER TABLE documento_aud ADD COLUMN materia VARCHAR(100);
ALTER TABLE documento_aud ADD COLUMN cantidad_copias INTEGER;
ALTER TABLE documento_aud ADD COLUMN curso_id BIGINT;
