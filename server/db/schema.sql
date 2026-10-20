CREATE TABLE IF NOT EXISTS users (
  id serial PRIMARY KEY,
  email text UNIQUE NOT NULL,
  nickname text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  avatar text,
  role text NOT NULL DEFAULT 'resident',
  is_blocked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
