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
  CREATE UNIQUE INDEX IF NOT EXISTS idx_genero_nome ON genero(nome);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_colecao_nome ON colecao(nome);
`);

const generosIniciais = [
  "Romance",
  "Ficcao cientifica",
  "Fantasia",
  "Terror",
  "Distopia",
  "Realismo",
  "Aventura",
  "Romance historico",
  "Literatura brasileira",
  "Literatura portuguesa",
];

const colecoesIniciais = [
  "Classicos da Literatura Brasileira",
  "Autores Machadianos",
  "Obras de Jorge Amado",
  "Classicos Mundiais",
  "Colecao Fantastica",
  "Literatura Portuguesa",
];

const inserirCatalogo = db.transaction(() => {
  const inserirGenero = db.prepare("INSERT OR IGNORE INTO genero (nome) VALUES (?)");
  for (const nome of generosIniciais) inserirGenero.run(nome);

  const inserirColecao = db.prepare("INSERT OR IGNORE INTO colecao (nome) VALUES (?)");
  for (const nome of colecoesIniciais) inserirColecao.run(nome);

  const livroPorTitulo = db.prepare("SELECT id FROM livros WHERE titulo = ?");
  const generoPorNome = db.prepare("SELECT id FROM genero WHERE nome = ?");
  const colecaoPorNome = db.prepare("SELECT id FROM colecao WHERE nome = ?");
  const inserirLivroGenero = db.prepare(`
    INSERT OR IGNORE INTO livro_genero (livro_id, genero_id)
    VALUES (?, ?)
  `);
  const inserirLivroColecao = db.prepare(`
    INSERT OR IGNORE INTO livro_colecao (livro_id, colecao_id)
    VALUES (?, ?)
  `);

  const relacionarGenero = (titulo, genero) => {
    const livro = livroPorTitulo.get(titulo);
    const generoRegistro = generoPorNome.get(genero);
    if (livro && generoRegistro) inserirLivroGenero.run(livro.id, generoRegistro.id);
  };

  const relacionarColecao = (titulo, colecao) => {
    const livro = livroPorTitulo.get(titulo);
    const colecaoRegistro = colecaoPorNome.get(colecao);
    if (livro && colecaoRegistro) inserirLivroColecao.run(livro.id, colecaoRegistro.id);
  };

  const livrosBrasileiros = [
    "Dom Casmurro",
    "Memorias Postumas de Bras Cubas",
    "Quincas Borba",
    "Iracema",
    "O Guarani",
    "Senhora",
    "O Cortico",
    "O Ateneu",
    "A Moreninha",
    "A Escrava Isaura",
    "Capitaes da Areia",
    "Gabriela, Cravo e Canela",
    "Tieta do Agreste",
    "Grande Sertao: Veredas",
    "Vidas Secas",
    "A Hora da Estrela",
    "O Alienista",
    "Angola Janga",
  ];

  for (const titulo of livrosBrasileiros) {
    relacionarGenero(titulo, "Literatura brasileira");
    relacionarColecao(titulo, "Classicos da Literatura Brasileira");
  }

  for (const titulo of ["Dom Casmurro", "Memorias Postumas de Bras Cubas", "Quincas Borba", "O Alienista"]) {
    relacionarGenero(titulo, "Realismo");
    relacionarColecao(titulo, "Autores Machadianos");
  }

  for (const titulo of ["Capitaes da Areia", "Gabriela, Cravo e Canela", "Tieta do Agreste"]) {
    relacionarColecao(titulo, "Obras de Jorge Amado");
    relacionarGenero(titulo, "Romance");
  }

  for (const titulo of [
    "O Primo Basilio",
    "Os Maias",
    "A Cidade e as Serras",
  ]) {
    relacionarGenero(titulo, "Literatura portuguesa");
    relacionarColecao(titulo, "Literatura Portuguesa");
  }

  for (const titulo of ["A Revolucao dos Bichos", "1984"]) {
    relacionarGenero(titulo, "Distopia");
    relacionarGenero(titulo, "Ficcao cientifica");
    relacionarColecao(titulo, "Classicos Mundiais");
  }

  for (const titulo of ["O Senhor dos Aneis", "O Pequeno Principe"]) {
    relacionarGenero(titulo, "Fantasia");
    relacionarColecao(titulo, "Colecao Fantastica");
    relacionarColecao(titulo, "Classicos Mundiais");
  }

  for (const titulo of ["Frankenstein"]) {
    relacionarGenero(titulo, "Terror");
    relacionarGenero(titulo, "Ficcao cientifica");
    relacionarColecao(titulo, "Classicos Mundiais");
  }

  for (const titulo of [
    "Orgulho e Preconceito",
    "Dom Quixote",
    "Jane Eyre",
    "Alice no Pais das Maravilhas",
  ]) {
    relacionarGenero(titulo, "Romance");
    relacionarColecao(titulo, "Classicos Mundiais");
  }
});

inserirCatalogo();

db.exec(`
  CREATE TABLE IF NOT EXISTS indicacao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descricao TEXT NOT NULL,
    status TEXT NOT NULL
  )
`);

export default db;
