\set ON_ERROR_STOP on
\connect storder_catalog

BEGIN;
SET LOCAL ROLE storder_catalog_app;

ALTER TABLE products ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';
CREATE UNIQUE INDEX IF NOT EXISTS categories_name_lower_uidx ON categories (lower(name));

COMMIT;
