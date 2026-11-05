// Conexão com o banco de dados (SQLite).
// O arquivo "biblioteca.db" é criado sozinho na pasta backend, se ainda não existir.

import Database from "better-sqlite3";
import path from "node:path";

const caminhoDoBanco = path.join(import.meta.dirname, "..", "biblioteca.db");
const db = new Database(caminhoDoBanco);

// Cria as tabelas, se ainda não existirem

db.exec(`
  CREATE TABLE IF NOT EXISTS livros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    autor TEXT NOT NULL,
    descricao TEXT,
    imagem TEXT NOT NULL,
    paginas TEXT NOT NULL,
    status TEXT NOT NULL,
    datadepublicacao DATE,
    sinopse TEXT
  )
`);

const colunasLivros = new Set(db.pragma("table_info(livros)").map(({ name }) => name));
const colunasAusentes = {
  descricao: "TEXT",
  imagem: "TEXT NOT NULL DEFAULT ''",
  paginas: "TEXT NOT NULL DEFAULT ''",
  status: "TEXT NOT NULL DEFAULT 'disponivel'",
  datadepublicacao: "DATE",
  sinopse: "TEXT",
};

for (const [coluna, definicao] of Object.entries(colunasAusentes)) {
  if (!colunasLivros.has(coluna)) {
    db.exec(`ALTER TABLE livros ADD COLUMN ${coluna} ${definicao}`);
  }
}

db.exec(`
  CREATE TABLE IF NOT EXISTS genero (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS colecao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS livro_genero (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    livro_id INTEGER NOT NULL,
    genero_id INTEGER NOT NULL,
    FOREIGN KEY (livro_id) REFERENCES livros(id),
    FOREIGN KEY (genero_id) REFERENCES genero(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS livro_colecao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    livro_id INTEGER NOT NULL,
    colecao_id INTEGER NOT NULL,
    FOREIGN KEY (livro_id) REFERENCES livros(id),
    FOREIGN KEY (colecao_id) REFERENCES colecao(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS indicacao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descricao TEXT NOT NULL,
    status TEXT NOT NULL
  )
`);

export default db;
