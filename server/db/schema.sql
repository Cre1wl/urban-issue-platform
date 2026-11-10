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

CREATE TABLE IF NOT EXISTS categories (
  id serial PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  color varchar(7) NOT NULL DEFAULT '#e5a54b',
  icon varchar(200) NOT NULL DEFAULT 'warning',
  is_active boolean NOT NULL DEFAULT true,
  is_system boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  resolve_hours int,
  created_by int REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE categories ADD COLUMN IF NOT EXISTS resolve_hours int;

CREATE UNIQUE INDEX IF NOT EXISTS categories_name_unique ON categories (lower(name));

CREATE TABLE IF NOT EXISTS statuses (
  id serial PRIMARY KEY,
  key text UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  color varchar(7) NOT NULL DEFAULT '#8b8b94',
  is_default boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_by int REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS statuses_name_unique ON statuses (lower(name));

CREATE TABLE IF NOT EXISTS responsible_services (
  id serial PRIMARY KEY,
  name text NOT NULL,
  created_by int REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS services_name_unique ON responsible_services (lower(name));

CREATE TABLE IF NOT EXISTS issues (
  id serial PRIMARY KEY,
  category_id int NOT NULL REFERENCES categories(id),
  description text NOT NULL,
  photo_urls text[] NOT NULL DEFAULT '{}',
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  address text NOT NULL DEFAULT '',
  status_id int NOT NULL REFERENCES statuses(id),
  assignee int REFERENCES responsible_services(id) ON DELETE SET NULL,
  reject_reason text,
  resolved_photo_url text,
  author_id int NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  votes int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS issues_status_idx ON issues (status_id);
CREATE INDEX IF NOT EXISTS issues_category_idx ON issues (category_id);
CREATE INDEX IF NOT EXISTS issues_created_idx ON issues (created_at DESC);

CREATE TABLE IF NOT EXISTS votes (
  id serial PRIMARY KEY,
  issue_id int NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id int NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (issue_id, user_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id serial PRIMARY KEY,
  issue_id int NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id int NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS comments_issue_idx ON comments (issue_id, created_at);

CREATE TABLE IF NOT EXISTS status_history (
  id serial PRIMARY KEY,
  issue_id int NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  from_status int REFERENCES statuses(id) ON DELETE SET NULL,
  to_status int REFERENCES statuses(id) ON DELETE SET NULL,
  changed_by int NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE status_history ALTER COLUMN to_status DROP NOT NULL;
ALTER TABLE status_history DROP CONSTRAINT IF EXISTS status_history_to_status_fkey;
ALTER TABLE status_history
  ADD CONSTRAINT status_history_to_status_fkey
  FOREIGN KEY (to_status) REFERENCES statuses(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS status_history_issue_idx ON status_history (issue_id, created_at);

INSERT INTO statuses (key, name, description, color, is_default, sort_order)
VALUES
  ('pending', 'На модерации', 'Обращение создано и ожидает проверки модератором', '#e5a54b', true, 1),
  ('published', 'Опубликовано', 'Обращение одобрено и видно всем жителям', '#4caf7d', true, 2),
  ('resolved', 'Решено', 'Проблема устранена, приложен отчёт о решении', '#5b9cf5', true, 3),
  ('rejected', 'Отклонено', 'Обращение отклонено с указанием причины', '#e07b6a', true, 4)
ON CONFLICT (key) DO NOTHING;

INSERT INTO categories (name, description, color, icon, is_system, sort_order)
VALUES ('Другое', 'Прочие проблемы городской инфраструктуры', '#e5a54b', 'warning', true, 999)
ON CONFLICT DO NOTHING;
