# Backend - Biblioteca Digital EEHC

API feita com Node.js e Express.

## Como rodar

1. Entre na pasta do backend:

   ```
   cd backend
   ```

2. Instale as dependências (só na primeira vez):

   ```
   npm install
   ```

3. Inicie o servidor:

   ```
   npm start
   ```

4. Abra no navegador: http://localhost:3000

Para o servidor reiniciar sozinho quando você salvar um arquivo, use `npm run dev`.

## Arquivos

- `server.js` - arquivo principal, liga o servidor
- `src/database.js` - conexão com o banco de dados
- `src/home.mjs` - código da página inicial
- `src/livro.mjs` - código dos livros
- `src/exemplos.mjs` - exemplos de query param, body, resposta em texto e em JSON
