CREATE TABLE curso (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    grado VARCHAR(50) NOT NULL,
    grupo VARCHAR(50) NOT NULL
);

CREATE TABLE curso_estudiante (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    curso_id BIGINT NOT NULL REFERENCES curso(id),
    estudiante_id BIGINT NOT NULL REFERENCES usuario(id),
    UNIQUE (curso_id, estudiante_id)
);

CREATE TABLE materia_curso_docente (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    curso_id BIGINT NOT NULL REFERENCES curso(id),
    docente_id BIGINT NOT NULL REFERENCES usuario(id),
    materia VARCHAR(100) NOT NULL,
    UNIQUE (curso_id, docente_id, materia)
);
