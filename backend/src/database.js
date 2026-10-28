// Conexão com o banco de dados (SQLite).
// O arquivo "biblioteca.db" é criado sozinho na pasta backend, se ainda não existir.

import Database from "better-sqlite3";
import path from "node:path";

const caminhoDoBanco = path.join(import.meta.dirname, "..", "biblioteca.db");
const db = new Database(caminhoDoBanco);

// Cria a tabela de livros, se ainda não existir
db.exec(`
  CREATE TABLE IF NOT EXISTS livros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    autor TEXT NOT NULL
  )
`);

export default db;
