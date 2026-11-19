\set ON_ERROR_STOP on
\connect storder_catalog

BEGIN;

REVOKE CONNECT ON DATABASE storder_catalog FROM PUBLIC;
SET LOCAL ROLE storder_catalog_app;

CREATE TABLE IF NOT EXISTS categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE CHECK (btrim(name) <> ''),
    description text
);

CREATE TABLE IF NOT EXISTS products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id uuid NOT NULL REFERENCES categories (id),
    sku text NOT NULL UNIQUE CHECK (btrim(sku) <> ''),
    name text NOT NULL CHECK (btrim(name) <> ''),
    unit_price numeric(12, 2) NOT NULL CHECK (unit_price >= 0 AND unit_price <> 'NaN'::numeric),
    stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid NOT NULL,
    status text NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON COLUMN orders.customer_id IS 'Identificador externo del usuario gestionado por auth-service.';

CREATE TABLE IF NOT EXISTS order_items (
    order_id uuid NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products (id),
    quantity integer NOT NULL CHECK (quantity > 0),
    unit_price numeric(12, 2) NOT NULL CHECK (unit_price >= 0 AND unit_price <> 'NaN'::numeric),
    PRIMARY KEY (order_id, product_id)
);

CREATE INDEX IF NOT EXISTS products_category_id_idx ON products (category_id);
CREATE INDEX IF NOT EXISTS orders_customer_id_idx ON orders (customer_id);
CREATE INDEX IF NOT EXISTS orders_status_created_at_idx ON orders (status, created_at);
CREATE INDEX IF NOT EXISTS order_items_product_id_idx ON order_items (product_id);

COMMIT;
