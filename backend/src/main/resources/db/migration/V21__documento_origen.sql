ALTER TABLE documento ADD COLUMN origen VARCHAR(20);
ALTER TABLE documento_aud ADD COLUMN origen VARCHAR(20);

UPDATE documento SET origen = 'PROPIO'
WHERE pedido_id IS NULL AND curso_id IS NULL
  AND usuario_id IN (SELECT u.id FROM usuario u JOIN nivel n ON n.id = u.nivel_id WHERE n.admin = true);

UPDATE documento SET origen = 'CLIENTE' WHERE origen IS NULL;

ALTER TABLE documento ALTER COLUMN origen SET NOT NULL;
