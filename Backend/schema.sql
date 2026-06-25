-- Run once to initialise the database
-- psql -U postgres -d ai_labs -f schema.sql

CREATE TABLE IF NOT EXISTS users (
  id          SERIAL          PRIMARY KEY,
  name        VARCHAR(255)    NOT NULL,
  email       VARCHAR(255)    UNIQUE NOT NULL,
  dob         DATE            NOT NULL,
  password    VARCHAR(255)    NOT NULL,          -- bcrypt hash
  phone       CHAR(10)        NOT NULL,
  created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users (email);
