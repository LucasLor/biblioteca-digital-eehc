// Rotas da página inicial.

import express from "express";

const router = express.Router();

// Rota de teste: http://localhost:3000/
router.get("/", (req, res) => {
  res.json({ mensagem: "API da Biblioteca Digital EEHC funcionando!" });
});

export default router;
