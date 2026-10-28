// Arquivo principal da API.
// Para iniciar: npm start

import express from "express";
import homeRouter from "./src/home.mjs";
import livroRouter from "./src/livro.mjs";

const app = express();
const PORTA = 3000;

// Permite que a API entenda dados enviados em formato JSON
app.use(express.json());

// Rotas da API
app.use("/", homeRouter);
app.use("/livros", livroRouter);

// Liga o servidor
app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
