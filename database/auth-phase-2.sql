\set ON_ERROR_STOP on
\connect storder_auth

BEGIN;

SET LOCAL ROLE storder_auth_app;

ALTER TABLE users ADD COLUMN IF NOT EXISTS name text
    CHECK (name IS NULL OR (name = btrim(name) AND char_length(name) BETWEEN 1 AND 100));

INSERT INTO roles (name) VALUES ('admin'), ('operator')
ON CONFLICT (name) DO NOTHING;

COMMIT;
