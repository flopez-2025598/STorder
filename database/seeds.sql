\set ON_ERROR_STOP on

\connect storder_auth
BEGIN;
INSERT INTO roles (name) VALUES ('admin'), ('operator')
ON CONFLICT (name) DO NOTHING;
COMMIT;

\connect storder_catalog
BEGIN;
INSERT INTO categories (name) VALUES ('Suministros'), ('Embalaje')
ON CONFLICT (name) DO NOTHING;
COMMIT;
