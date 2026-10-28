// Rotas dos livros.

import express from "express";

const router = express.Router();

// Rota de teste: http://localhost:3000/livros
router.get("/", (req, res) => {
  res.json({ mensagem: "Rota de livros funcionando!" });
});

// Exemplo 1: receber QUERY PARAM (dados que vêm na URL, depois do "?")
// Teste no navegador: http://localhost:3000/livros/busca?titulo=Dom Casmurro
router.get("/busca", (req, res) => {
  const titulo = req.query.titulo;

  res.json({ mensagem: "Você buscou pelo título:", titulo: titulo });
});

// Exemplo 2: receber BODY (dados que vêm dentro da requisição, em JSON)
// Teste com curl:
// curl -X POST http://localhost:3000/livros -H "Content-Type: application/json" -d '{"titulo":"Dom Casmurro","autor":"Machado de Assis"}'
router.post("/", (req, res) => {
  const titulo = req.body.titulo;
  const autor = req.body.autor;

  res.json({ mensagem: "Livro recebido!", titulo: titulo, autor: autor });
});

// Exemplo 3: responder com TEXTO simples
// Teste no navegador: http://localhost:3000/livros/texto
router.get("/texto", (req, res) => {
  res.send("Isso é uma resposta em texto!");
});

// Exemplo 4: responder com JSON (já usado nas rotas acima)
// Teste no navegador: http://localhost:3000/livros/json
router.get("/json", (req, res) => {
  res.json({ resposta: "Isso é uma resposta em JSON!" });
});

export default router;
