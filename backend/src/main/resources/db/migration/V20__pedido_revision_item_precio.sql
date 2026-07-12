ALTER TABLE pedido ADD COLUMN motivo_revision VARCHAR(500);
ALTER TABLE pedido_aud ADD COLUMN motivo_revision VARCHAR(500);

ALTER TABLE pedido_item ADD COLUMN precio_unitario NUMERIC(12, 2);
ALTER TABLE pedido_item_aud ADD COLUMN precio_unitario NUMERIC(12, 2);

UPDATE pedido_item pi SET precio_unitario = p.precio_venta
FROM producto p WHERE pi.producto_id = p.codigo_producto AND pi.precio_unitario IS NULL;

UPDATE pedido_item pi SET precio_unitario = o.precio
FROM oferta o WHERE pi.oferta_id = o.id AND pi.precio_unitario IS NULL;

ALTER TABLE pedido_item ALTER COLUMN precio_unitario SET NOT NULL;
