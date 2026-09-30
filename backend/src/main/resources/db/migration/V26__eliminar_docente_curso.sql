-- Se elimina la feature de docentes/cursos (fuera de alcance): solo quedan roles Admin y Estandar.

-- Reasignar cualquier usuario con nivel Docente a Estandar antes de borrar la fila de nivel.
UPDATE usuario
SET nivel_id = (SELECT id FROM nivel WHERE nombre = 'Estandar')
WHERE nivel_id = (SELECT id FROM nivel WHERE nombre = 'Docente');

DROP TABLE IF EXISTS materia_curso_docente;
DROP TABLE IF EXISTS curso_estudiante;

ALTER TABLE documento DROP COLUMN IF EXISTS curso_id;
ALTER TABLE documento DROP COLUMN IF EXISTS materia;
ALTER TABLE documento DROP COLUMN IF EXISTS codigo;
ALTER TABLE documento DROP COLUMN IF EXISTS es_practico;
ALTER TABLE documento DROP COLUMN IF EXISTS nro_practico;

ALTER TABLE documento_aud DROP COLUMN IF EXISTS curso_id;
ALTER TABLE documento_aud DROP COLUMN IF EXISTS materia;
ALTER TABLE documento_aud DROP COLUMN IF EXISTS codigo;
ALTER TABLE documento_aud DROP COLUMN IF EXISTS es_practico;
ALTER TABLE documento_aud DROP COLUMN IF EXISTS nro_practico;

DROP TABLE IF EXISTS curso;

DELETE FROM nivel WHERE nombre = 'Docente';
ALTER TABLE nivel DROP COLUMN IF EXISTS docente;
ALTER TABLE nivel_aud DROP COLUMN IF EXISTS docente;
