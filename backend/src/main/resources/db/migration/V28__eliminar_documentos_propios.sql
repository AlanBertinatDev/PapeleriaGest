DELETE FROM documento_aud WHERE id IN (SELECT id FROM documento WHERE pedido_id IS NULL);
DELETE FROM documento WHERE pedido_id IS NULL;

ALTER TABLE documento ALTER COLUMN pedido_id SET NOT NULL;

ALTER TABLE documento DROP COLUMN origen;
ALTER TABLE documento_aud DROP COLUMN origen;
