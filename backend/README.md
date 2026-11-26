# Backend - Biblioteca Digital EEHC

API feita com Node.js e Express.

## Como rodar

Use Node.js 22 LTS. Versões mais novas, como o Node.js 24, podem exigir ferramentas de compilação do Windows para instalar o `better-sqlite3`.

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
- `src/database.js` - conexão com o banco de dados SQLite (cria o arquivo `biblioteca.db` sozinho)
- `src/home.mjs` - código da página inicial
- `src/livro.mjs` - código dos livros
- `src/exemplos.mjs` - exemplos de query param, body, resposta em texto e em JSON
- `src/exemplos-banco.mjs` - exemplos de criar, listar, buscar, atualizar e apagar no banco
