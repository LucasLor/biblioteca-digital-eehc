// Rotas dos livros.

import express from "express";

const router = express.Router();

// Rota de teste: http://localhost:3000/livros
router.get("/", (req, res) => {
  res.json({ mensagem: "Rota de livros funcionando!" });
});

export default router;
