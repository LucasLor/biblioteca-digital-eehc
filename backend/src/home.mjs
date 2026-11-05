// Rotas da página inicial.

import express from "express";
import db from "./database.js"

const router = express.Router();

// Rota de teste: http://localhost:3000/
router.get("/", (req, res) => {
  // Lista de livros pegas do banco
  const livros = db.prepare("SELECT * FROM livros WHERE status = ?").all("disponivel");

  return res.status(200).json({ livros });
});



export default router;
