// Rotas da página inicial.

import express from "express";
import db from "./database.js"

const router = express.Router();

// Rota de teste: http://localhost:3000/
router.get("/", (req, res) => {
  // Lista de livros pegas do banco
  const livros = db.prepare("SELECT * FROM livros WHERE status = ?").all("disponivel");
  const generos = db.prepare("SELECT id, nome FROM genero ORDER BY nome").all();
  const colecoes = db.prepare("SELECT id, nome FROM colecao ORDER BY nome").all();

  return res.status(200).json({ livros, generos, colecoes });
});

router.get("/search", (req, res) => {
  const { pesquisa,genero,status } = req.query;
  
  if (!pesquisa || !genero || !status) {
    return res.status(400).json({ error: "Parâmetros de pesquisa inválidos." });
  }
  
let query = "SELECT * FROM livros  ";

  if (genero=="todos") { 
    query += "where  "
  }else{
    query += " join livro_genero on livros.id = livro_genero.livro_id join genero on livro_genero.genero_id = genero.id where genero.nome = ? and "
  }
    
 
  
  

  if ( status  == "todos") {
    query += "status IN ('disponivel', 'indisponivel') ";
  } else {
    query += `status = '${status}' `;
  }


  // Lista de livros pegas do banco
  let livros = null

  if (genero=="todos") {
    livros = db.prepare(query + "AND titulo LIKE ?").all(`%${pesquisa}%`);
  } else {
    livros = db.prepare(query + "AND titulo LIKE ?").all(genero, `%${pesquisa}%`);
  }

  return res.status(200).json({ livros });
});


export default router;
