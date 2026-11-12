// Rotas dos livros.

import express from "express";
import db from "./database.js"
const router = express.Router();

// Rota de teste: http://localhost:3000/livros
router.get("/search", (req, res) => {
  const { pesquisa, genero, status } = req.query;

  if (!pesquisa || !genero || !status) {
    return res.status(400).json({ error: "Parâmetros de pesquisa inválidos." });
  }

  let query = `
    SELECT DISTINCT
      livros.*,
      colecao.nome AS nome_colecao,
      genero_lista.nome AS nome_genero
    FROM livros
    LEFT JOIN livro_colecao ON livros.id = livro_colecao.livro_id
    LEFT JOIN colecao ON livro_colecao.colecao_id = colecao.id
    LEFT JOIN livro_genero AS livro_genero_lista ON livros.id = livro_genero_lista.livro_id
    LEFT JOIN genero AS genero_lista ON livro_genero_lista.genero_id = genero_lista.id
  `;
  const queryParams = [];
  const whereClauses = [];

  // 1. Tratamento do Gênero (Mecanismo de JOIN caso não seja "todos")
  if (genero !== "todos") {
    whereClauses.push(`EXISTS (
      SELECT 1
      FROM livro_genero
      JOIN genero ON livro_genero.genero_id = genero.id
      WHERE livro_genero.livro_id = livros.id AND genero.nome = ?
    )`);
    queryParams.push(genero);
  }

  // 2. Filtro de Status (DISPONIVEL ou INDISPONIVEL)
  if (status !== "todos") {
    whereClauses.push("livros.status = ?");
    queryParams.push(status);
  }

  // 3. Busca no título, autor ou descrição.
  whereClauses.push("(livros.titulo LIKE ? OR livros.autor LIKE ? OR livros.descricao LIKE ?)");
  const termoBusca = `%${pesquisa}%`;
  queryParams.push(termoBusca, termoBusca, termoBusca);

  // 4. Montagem da cláusula WHERE
  if (whereClauses.length > 0) {
    query += " WHERE " + whereClauses.join(" AND ");
  }



  // 5. Execução no Banco de Dados
  try {
    const rows = db.prepare(query).all(...queryParams);
    const livrosPorId = new Map();

    for (const { nome_colecao, nome_genero, ...livro } of rows) {
      if (!livrosPorId.has(livro.id)) {
        livrosPorId.set(livro.id, { ...livro, colecoes: [], generos: [] });
      }

      if (nome_colecao) {
        const livroAgrupado = livrosPorId.get(livro.id);
        if (!livroAgrupado.colecoes.includes(nome_colecao)) {
          livroAgrupado.colecoes.push(nome_colecao);
        }
      }

      if (nome_genero) {
        const livroAgrupado = livrosPorId.get(livro.id);
        if (!livroAgrupado.generos.includes(nome_genero)) {
          livroAgrupado.generos.push(nome_genero);
        }
      }
    }

    return res.status(200).json([...livrosPorId.values()]);
  } catch (err) {
    console.error("Erro na busca de livros:", err);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
});


// Rota de teste: http://localhost:3000/{id}
// 1 - remover os parametros de pesquisa da rota
// 2 - criar uma rota para buscar livro por ID

router.get("/:id", (req, res) => {
  const  id  = req.params.id;
  

  let query = `
    SELECT DISTINCT
      livros.*,
      colecao.nome AS nome_colecao,
      genero_lista.nome AS nome_genero
    FROM livros
    LEFT JOIN livro_colecao ON livros.id = livro_colecao.livro_id
    LEFT JOIN colecao ON livro_colecao.colecao_id = colecao.id
    LEFT JOIN livro_genero AS livro_genero_lista ON livros.id = livro_genero_lista.livro_id
    LEFT JOIN genero AS genero_lista ON livro_genero_lista.genero_id = genero_lista.id
    where livros.id = ? 

  `;
   
    const livro = db.prepare(query).get(id);
    
    if (!livro) {
      return res.status(404).json({ error: "Livro não encontrado." });
    }
    res.json(livro);
});


export default router;
