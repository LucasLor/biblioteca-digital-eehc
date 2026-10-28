// Exemplos de operações básicas no banco de dados (CRUD) usando SQL.
// CRUD = Create (criar), Read (ler), Update (atualizar), Delete (apagar).
//
// Os "?" nos comandos SQL são espaços reservados: o valor real é passado
// separado. Isso evita um ataque chamado SQL Injection, então NUNCA monte
// o SQL juntando texto com os dados do usuário.

import express from "express";
import db from "./database.js";

const router = express.Router();

// CREATE: adicionar um livro
// curl -X POST http://localhost:3000/exemplos-banco -H "Content-Type: application/json" -d '{"titulo":"Dom Casmurro","autor":"Machado de Assis"}'
router.post("/", (req, res) => {
  const { titulo, autor } = req.body;

  if (!titulo || !autor) {
    return res.status(400).json({ erro: "Envie titulo e autor" });
  }

  const resultado = db
    .prepare("INSERT INTO livros (titulo, autor) VALUES (?, ?)")
    .run(titulo, autor);

  res.status(201).json({ id: resultado.lastInsertRowid, titulo, autor });
});

// READ: listar todos os livros
// Teste no navegador: http://localhost:3000/exemplos-banco
router.get("/", (req, res) => {
  const livros = db.prepare("SELECT * FROM livros").all();

  res.json(livros);
});

// READ: buscar um livro pelo id
// Teste no navegador: http://localhost:3000/exemplos-banco/1
router.get("/:id", (req, res) => {
  const livro = db.prepare("SELECT * FROM livros WHERE id = ?").get(req.params.id);

  if (!livro) {
    return res.status(404).json({ erro: "Livro não encontrado" });
  }

  res.json(livro);
});

// UPDATE: atualizar um livro
// curl -X PUT http://localhost:3000/exemplos-banco/1 -H "Content-Type: application/json" -d '{"titulo":"Memórias Póstumas","autor":"Machado de Assis"}'
router.put("/:id", (req, res) => {
  const { titulo, autor } = req.body;

  if (!titulo || !autor) {
    return res.status(400).json({ erro: "Envie titulo e autor" });
  }

  const resultado = db
    .prepare("UPDATE livros SET titulo = ?, autor = ? WHERE id = ?")
    .run(titulo, autor, req.params.id);

  // "changes" é quantas linhas foram alteradas. Se for 0, o id não existe.
  if (resultado.changes === 0) {
    return res.status(404).json({ erro: "Livro não encontrado" });
  }

  res.json({ id: Number(req.params.id), titulo, autor });
});

// DELETE: apagar um livro
// curl -X DELETE http://localhost:3000/exemplos-banco/1
router.delete("/:id", (req, res) => {
  const resultado = db.prepare("DELETE FROM livros WHERE id = ?").run(req.params.id);

  if (resultado.changes === 0) {
    return res.status(404).json({ erro: "Livro não encontrado" });
  }

  res.json({ mensagem: "Livro apagado!" });
});

export default router;
