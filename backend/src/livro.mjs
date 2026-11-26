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
      colecao.id AS colecao_id,
      genero_lista.id AS genero_id
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

    for (const { colecao_id, genero_id, ...livro } of rows) {
      if (!livrosPorId.has(livro.id)) {
        livrosPorId.set(livro.id, { ...livro, colecoes: [], generos: [] });
      }

      if (colecao_id !== null) {
        const livroAgrupado = livrosPorId.get(livro.id);
        if (!livroAgrupado.colecoes.includes(colecao_id)) {
          livroAgrupado.colecoes.push(colecao_id);
        }
      }

      if (genero_id !== null) {
        const livroAgrupado = livrosPorId.get(livro.id);
        if (!livroAgrupado.generos.includes(genero_id)) {
          livroAgrupado.generos.push(genero_id);
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
  const { id } = req.params;
  const query = `
    SELECT DISTINCT
      livros.*,
      colecao.id AS colecao_id,
      genero_lista.id AS genero_id
    FROM livros
    LEFT JOIN livro_colecao ON livros.id = livro_colecao.livro_id
    LEFT JOIN colecao ON livro_colecao.colecao_id = colecao.id
    LEFT JOIN livro_genero AS livro_genero_lista ON livros.id = livro_genero_lista.livro_id
    LEFT JOIN genero AS genero_lista ON livro_genero_lista.genero_id = genero_lista.id
    WHERE livros.id = ?
  `;

  try {
    const rows = db.prepare(query).all(id);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Livro não encontrado." });
    }

    const livrosPorId = new Map();

    for (const { colecao_id, genero_id, ...livro } of rows) {
      if (!livrosPorId.has(livro.id)) {
        livrosPorId.set(livro.id, { ...livro, colecoes: [], generos: [] });
      }

      const livroAgrupado = livrosPorId.get(livro.id);
      if (colecao_id !== null && !livroAgrupado.colecoes.includes(colecao_id)) {
        livroAgrupado.colecoes.push(colecao_id);
      }
      if (genero_id !== null && !livroAgrupado.generos.includes(genero_id)) {
        livroAgrupado.generos.push(genero_id);
      }
    }

    return res.status(200).json(livrosPorId.get(rows[0].id));
  } catch (err) {
    console.error("Erro ao buscar livro:", err);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
});

router.post("/create", (req, res) => {
  const {
    titulo,
    autor,
    descricao,
    status,
    paginas,
    imagem,
    datadepublicacao,
    sinopse,
    generos_id,
  } = req.body;
  const colecoes_id = req.body.colecao_id ?? req.body.colecoes_id;

  if (
    typeof titulo !== "string" ||
    !titulo.trim() ||
    typeof autor !== "string" ||
    !autor.trim() ||
    typeof status !== "string" ||
    !status.trim() ||
    paginas === undefined ||
    paginas === null ||
    paginas === "" ||
    typeof imagem !== "string" ||
    !imagem.trim()
  ) {
    return res.status(400).json({ error: "Parâmetros de criação inválidos." });
  }

  if (
    (generos_id !== undefined &&
      (!Array.isArray(generos_id) ||
        !generos_id.every((id) => Number.isInteger(id) && id > 0))) ||
    (colecoes_id !== undefined &&
      (!Array.isArray(colecoes_id) ||
        !colecoes_id.every((id) => Number.isInteger(id) && id > 0)))
  ) {
    return res.status(400).json({ error: "IDs de gêneros ou coleções inválidos." });
  }

  const generos = generos_id ?? [];
  const colecoes = colecoes_id ?? [];

  try {
    const generoExiste = db.prepare("SELECT 1 FROM genero WHERE id = ?");
    for (const id of generos) {
      if (!generoExiste.get(id)) {
        return res.status(400).json({ error: `Gênero com ID ${id} não encontrado.` });
      }
    }

    const colecaoExiste = db.prepare("SELECT 1 FROM colecao WHERE id = ?");
    for (const id of colecoes) {
      if (!colecaoExiste.get(id)) {
        return res.status(400).json({ error: `Coleção com ID ${id} não encontrada.` });
      }
    }

    const criarLivro = db.transaction(() => {
      const resultado = db.prepare(`
        INSERT INTO livros (titulo, autor, descricao, status, paginas, imagem, datadepublicacao, sinopse)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        titulo,
        autor,
        descricao ?? null,
        status,
        paginas,
        imagem,
        datadepublicacao ?? null,
        sinopse ?? null,
      );
      const livroId = resultado.lastInsertRowid;

      const inserirGenero = db.prepare(
        "INSERT INTO livro_genero (livro_id, genero_id) VALUES (?, ?)",
      );
      for (const id of generos) inserirGenero.run(livroId, id);

      const inserirColecao = db.prepare(
        "INSERT INTO livro_colecao (livro_id, colecao_id) VALUES (?, ?)",
      );
      for (const id of colecoes) inserirColecao.run(livroId, id);

      return livroId;
    });

    const id = criarLivro();
    return res.status(201).json({ message: "Livro criado com sucesso.", id });
  } catch (err) {
    console.error("Erro ao criar livro:", err);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }


});


      router.put("/:id", (req, res) => {
        const updateData = req.body;
        const { id } = req.params;

        const livroExistente = db.prepare("SELECT * FROM livros WHERE id = ?").get(id);
        if (!livroExistente) {
          return res.status(404).json({ error: "Livro não encontrado." });
        }



    if (
    typeof updateData.titulo !== "string" ||
    !updateData.titulo.trim() ||
    typeof updateData.autor !== "string" ||
    !updateData.autor.trim() ||
    typeof updateData.status !== "string" ||
    !updateData.status.trim() ||
    updateData.paginas === undefined ||
    updateData.paginas === null ||
    updateData.paginas === "" ||
    typeof updateData.imagem !== "string" ||
    !updateData.imagem.trim()
  ) {
    return res.status(400).json({ error: "Parâmetros de criação inválidos." });
  }



        const result = db.prepare(`
          UPDATE livros
          SET titulo = COALESCE(?, titulo),
              autor = COALESCE(?, autor),
              descricao = COALESCE(?, descricao),
              status = COALESCE(?, status),
              paginas = COALESCE(?, paginas),
              imagem = COALESCE(?, imagem),
              datadepublicacao = COALESCE(?, datadepublicacao),
              sinopse = COALESCE(?, sinopse)
          WHERE id = ?
        `).run(
          updateData.titulo ?? livroExistente.titulo,
          updateData.autor ?? livroExistente.autor,
          updateData.descricao ?? livroExistente.descricao,
          updateData.status ?? livroExistente.status,
          updateData.paginas ?? livroExistente.paginas,
          updateData.imagem ?? livroExistente.imagem,
          updateData.datadepublicacao ?? livroExistente.datadepublicacao,
          updateData.sinopse ?? livroExistente.sinopse,
          id
        );

        return res.status(200).json({ message: "Livro atualizado com sucesso." });
      });

      router.post("/:id/generos", (req, res) => {
        const { id } = req.params;
        const { generos_id } = req.body;
      const livroExistente = db.prepare("SELECT * FROM livros WHERE id = ?").get(id);
        if (!livroExistente) {
          return res.status(404).json({ error: "Livro não encontrado." });
        }
        if (!Array.isArray(generos_id) || !generos_id.every((id) => Number.isInteger(id) && id > 0)) {
          return res.status(400).json({ error: "IDs de gêneros inválidos." });
        }
        for (const generoId of generos_id) {
          const generoExistente = db.prepare("SELECT * FROM genero WHERE id = ?").get(generoId);
          if (!generoExistente) {
            return res.status(404).json({ error: `Gênero com ID ${generoId} não encontrado.` });
          }
        }
        // Insert into livro_genero
        const inserirGenero = db.prepare(
          "INSERT OR IGNORE INTO livro_genero (livro_id, genero_id) VALUES (?, ?)"
        );    
      

        for (const generoId of generos_id) {
          inserirGenero.run(id, generoId);
        }

        return res.status(200).json({ message: "Gêneros adicionados ao livro com sucesso." });


      

      });

      router.delete("/:id/generos", (req, res) => {
        const { id } = req.params;
        const { generos_id } = req.body;
        const livroExistente = db.prepare("SELECT * FROM livros WHERE id = ?").get(id);

        if (!livroExistente) {
          return res.status(404).json({ error: "Livro não encontrado." });
        }

        if (!Array.isArray(generos_id) || !generos_id.every((id) => Number.isInteger(id) && id > 0)) {
          return res.status(400).json({ error: "IDs de gêneros inválidos." });
        }

        const removerGenero = db.prepare(
          "DELETE FROM livro_genero WHERE livro_id = ? AND genero_id = ?"
        );


        return res.status(200).json({ message: "Gêneros removidos do livro com sucesso." });


      });
      

      router.post("/:id/colecao", (req, res) => {
        const { id } = req.params;
        const { colecao_id } = req.body;
      const livroExistente = db.prepare("SELECT * FROM livros WHERE id = ?").get(id);
        if (!livroExistente) {
          return res.status(404).json({ error: "Livro não encontrado." });
        }
        if (!Array.isArray(colecao_id) || !colecao_id.every((id) => Number.isInteger(id) && id > 0)) {
          return res.status(400).json({ error: "IDs de coleções inválidos." });
        }
        for (const colecaoId of colecao_id) {
          const colecaoExistente = db.prepare("SELECT * FROM colecao WHERE id = ?").get(colecaoId);
          if (!colecaoExistente) {
            return res.status(404).json({ error: `Coleção com ID ${colecaoId} não encontrada.` });
          }
        }
        // Insert into livro_colecao
        const inserirColecao = db.prepare(
          "INSERT OR IGNORE INTO livro_colecao (livro_id, colecao_id) VALUES (?, ?)"
        );

        for (const colecaoId of colecao_id) {
          inserirColecao.run(id, colecaoId);
        }

        return res.status(200).json({ message: "Coleções adicionadas ao livro com sucesso." });
      });


      router.delete("/:id/colecao", (req, res) => { 
        const { id } = req.params;
        const { colecao_id } = req.body;
      const livroExistente = db.prepare("SELECT * FROM livros WHERE id = ?").get(id);
        if (!livroExistente) {
          return res.status(404).json({ error: "Livro não encontrado." });
        }
        if (!Array.isArray(colecao_id) || !colecao_id.every((id) => Number.isInteger(id) && id > 0)) {
          return res.status(400).json({ error: "IDs de coleções inválidos." });
        }
        for (const colecaoId of colecao_id) {
          const colecaoExistente = db.prepare("SELECT * FROM colecao WHERE id = ?").get(colecaoId);
          if (!colecaoExistente) {
            return res.status(404).json({ error: `Coleção com ID ${colecaoId} não encontrada.` });
          }
        } 
        const removerColecao = db.prepare(
          "DELETE FROM livro_colecao WHERE livro_id = ? AND colecao_id = ?",
        );
        const removerColecoes = db.transaction(() => {
          for (const colecaoId of colecao_id) {
            removerColecao.run(id, colecaoId);
          }
        });

        removerColecoes();
        return res.status(200).json({ message: "Coleções removidas do livro com sucesso." });
      });

export default router;
