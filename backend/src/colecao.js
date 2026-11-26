import express from "express";
import db from "./database.js";

const router = express.Router();

// GET /colecoes
router.get("/", (req, res) => {
  const colecoes = db.prepare("SELECT * FROM colecao ORDER BY id").all();
  res.json(colecoes);
});

// POST /colecoes
router.post("/", (req, res) => {
  const nome = req.body.nome?.trim();

  if (!nome) {
    return res.status(400).json({ error: "O nome da coleção é obrigatório." });
  }

  try {
    const resultado = db.prepare("INSERT INTO colecao (nome) VALUES (?)").run(nome);
    res.status(201).json({ id: resultado.lastInsertRowid, nome });
  } catch (erro) {
    if (erro.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ error: "Já existe uma coleção com esse nome." });
    }

    console.error("Erro ao criar coleção:", erro);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// PUT /colecoes/:id
router.put("/:id", (req, res) => {
  const nome = req.body.nome?.trim();
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "ID inválido." });
  }

  if (!nome) {
    return res.status(400).json({ error: "O nome da coleção é obrigatório." });
  }

  try {
    const resultado = db.prepare("UPDATE colecao SET nome = ? WHERE id = ?").run(nome, id);

    if (resultado.changes === 0) {
      return res.status(404).json({ error: "Coleção não encontrada." });
    }

    res.json({ id, nome });
  } catch (erro) {
    if (erro.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ error: "Já existe uma coleção com esse nome." });
    }

    console.error("Erro ao atualizar coleção:", erro);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// DELETE /colecoes/:id
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "ID inválido." });
  }

  const apagarColecao = db.transaction(() => {
    db.prepare("DELETE FROM livro_colecao WHERE colecao_id = ?").run(id);
    return db.prepare("DELETE FROM colecao WHERE id = ?").run(id);
  });

  try {
    const resultado = apagarColecao();

    if (resultado.changes === 0) {
      return res.status(404).json({ error: "Coleção não encontrada." });
    }

    res.status(204).send();
  } catch (erro) {
    console.error("Erro ao apagar coleção:", erro);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
  
});

export default router;
