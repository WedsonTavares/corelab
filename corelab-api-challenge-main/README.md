# 📦 Corelab API - Gerenciador de Tarefas

API RESTful para gerenciamento de tarefas (to-do list), desenvolvida em Node.js com Express e MongoDB Atlas, totalmente adaptada para o domínio de tarefas e documentada em português.

## 🚀 Como rodar o backend

1. **Pré-requisitos:**
   - Node.js 16.15.0+
   - npm 8.5.5+
   - MongoDB Atlas (ou outro MongoDB compatível)

2. **Instalação:**
   ```bash
   cd corelab-api-challenge-main
   npm install
   ```

3. **Configuração:**
   - Renomeie o arquivo `.env.example` para `.env` (ou edite o `.env` existente)
   - Configure a variável `MONGODB_URI` com sua string de conexão do MongoDB Atlas

4. **Rodando o servidor:**
   ```bash
   npm run dev
   ```
   O backend estará disponível em `http://localhost:3333`

## 🌐 Endpoints

| Método   | Endpoint                | Descrição                  |
|----------|-------------------------|----------------------------|
| GET      | /                       | Status da API              |
| GET      | /tasks                  | Listar todas as tarefas    |
| GET      | /tasks/:id              | Buscar tarefa específica   |
| POST     | /tasks                  | Criar nova tarefa          |
| PUT      | /tasks/:id              | Atualizar tarefa           |
| DELETE   | /tasks/:id              | Excluir tarefa             |
| PATCH    | /tasks/:id/favorite     | Alternar favorito          |

### Parâmetros de Query (GET /tasks)
- `search`   - Buscar por título ou descrição
- `favorite` - Filtrar favoritos (true/false)
- `color`    - Filtrar por cor (hexadecimal)

## 🛠️ Scripts
- `npm run dev`   - Inicia servidor em modo desenvolvimento
- `npm run build` - Build para produção
- `npm start`     - Inicia servidor em produção
- `npm test`      - Executa testes (se houver)

## 📝 Changelog
- Refatoração completa do domínio de veículos para tarefas
- Integração com MongoDB Atlas usando Mongoose
- Tradução total do código e documentação para português
- Remoção de arquivos legados e código não utilizado
- Endpoints RESTful padronizados e documentação atualizada

## 🐞 Dicas de Solução de Problemas
- **Erro de conexão MongoDB:** verifique a URI no `.env` e permissões no Atlas
- **Erro de CORS:** confira se o frontend está apontando para a porta correta
- **Dependências:**
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

## 👨‍💻 Autor
Wedson Lima

---

**O céu é o limite! 🚀**