ALTER TABLE pedido_item ALTER COLUMN producto_id DROP NOT NULL;
ALTER TABLE pedido_item ADD COLUMN oferta_id BIGINT REFERENCES oferta(id);
ALTER TABLE pedido_item DROP CONSTRAINT pedido_item_pedido_id_producto_id_key;
ALTER TABLE pedido_item ADD CONSTRAINT pedido_item_producto_xor_oferta CHECK (
    (producto_id IS NOT NULL AND oferta_id IS NULL) OR (producto_id IS NULL AND oferta_id IS NOT NULL)
);

ALTER TABLE pedido_item_aud ADD COLUMN oferta_id BIGINT;
