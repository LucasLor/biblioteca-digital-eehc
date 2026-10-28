// Arquivo principal da API.
// Para iniciar: npm start

import express from "express";

const app = express();
const PORTA = 3000;

// Permite que a API entenda dados enviados em formato JSON
app.use(express.json());

// Rota de teste: abra http://localhost:3000 no navegador
app.get("/", (req, res) => {
  res.json({ mensagem: "API da Biblioteca Digital EEHC funcionando!" });
});

// Liga o servidor
app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
