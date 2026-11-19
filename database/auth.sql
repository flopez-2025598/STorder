\set ON_ERROR_STOP on
\connect storder_auth

BEGIN;

REVOKE CONNECT ON DATABASE storder_auth FROM PUBLIC;
SET LOCAL ROLE storder_auth_app;

CREATE TABLE IF NOT EXISTS roles (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name text NOT NULL UNIQUE CHECK (btrim(name) <> '')
);

CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL CHECK (email = btrim(email) AND email <> ''),
    password_hash text NOT NULL CHECK (btrim(password_hash) <> ''),
    role_id integer NOT NULL REFERENCES roles (id),
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_uidx ON users (lower(email));
CREATE INDEX IF NOT EXISTS users_role_id_idx ON users (role_id);

COMMIT;
