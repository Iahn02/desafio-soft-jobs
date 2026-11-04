-- Ejecutar con: psql -U postgres -f schema.sql
-- Es el script del material de apoyo (database/DDL.sql del cliente):
-- igual al del enunciado, pero con el email UNIQUE para no repetir usuarios.
CREATE DATABASE softjobs;

\c softjobs;

CREATE TABLE usuarios (
  id        SERIAL        NOT NULL,
  email     VARCHAR(50)   NOT NULL  UNIQUE,
  password  VARCHAR(60)   NOT NULL,
  rol       VARCHAR(25)   NOT NULL,
  lenguage  VARCHAR(20)   NOT NULL,
  PRIMARY KEY (id)
);
