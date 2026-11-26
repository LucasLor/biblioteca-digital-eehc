# biblioteca-digital-eehc

Projeto de ensino: uma biblioteca digital com API feita em Node.js.

## Como iniciar a API

Você precisa ter o Node.js 22 LTS instalado. O `better-sqlite3` usado pelo projeto não possui versão pré-compilada compatível com o Node.js 24 no ambiente atual.

1. Entre na pasta do backend:

   ```
   cd backend
   ```

2. Instale as dependências (só na primeira vez):

   ```
   npm install
   ```

3. Inicie a API:

   ```
   npm start
   ```

4. Teste abrindo no navegador: http://localhost:3000

   Se aparecer a mensagem "API da Biblioteca Digital EEHC funcionando!", deu certo.

Para parar a API, aperte `Ctrl + C` no terminal.

Dica: com `npm run dev` a API reinicia sozinha toda vez que você salvar um arquivo.
