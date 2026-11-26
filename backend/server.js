// Arquivo principal da API.
// Para iniciar: npm start

import express from "express";
import path from "node:path";
import homeRouter from "./src/home.mjs";
import livroRouter from "./src/livro.mjs";
import exemplosRouter from "./src/exemplos.mjs";
import exemplosBancoRouter from "./src/exemplos-banco.mjs";
import generoRouter from "./src/genero.mjs";
const app = express();
const PORTA = 3000;

// Permite que a API entenda dados enviados em formato JSON
app.use(express.json());

// Serve o frontend integrado na mesma origem da API.
app.use(express.static(path.join(import.meta.dirname, "..", "novo front end")));

// Rotas da API
app.use("/", homeRouter);
app.use("/genero", generoRouter);
app.use("/livros", livroRouter);


// Liga o servidor
app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
