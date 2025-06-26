# 🖥️ Corelab Web - Gerenciador de Tarefas

Frontend React para o Gerenciador de Tarefas, totalmente responsivo, moderno, limpo e documentado em português. Integração completa com a API Node/MongoDB.

## 🚀 Como rodar o frontend

1. **Pré-requisitos:**
   - Node.js 16.15.0+
   - npm 8.5.5+

2. **Instalação:**
   ```bash
   cd corelab-web-challenge-main
   npm install
   ```

3. **Rodando o app:**
   ```bash
   npm start
   ```
   O frontend estará disponível em `http://localhost:3000`

## 🎨 Design & Funcionalidades
- **CRUD de tarefas**: criar, editar, excluir, listar
- **Favoritos**: destaque e filtro
- **Cores personalizadas**: organização visual
- **Busca e filtros**: por texto, cor e favoritos
- **Modal intuitivo**: criação/edição com validação
- **Responsividade**: mobile first, grid adaptativo
- **Acessibilidade**: ARIA, navegação por teclado
- **Feedback visual**: loading, erros, confirmações

## 🛠️ Scripts
- `npm start`   - Inicia em modo desenvolvimento
- `npm run build` - Build para produção
- `npm test`    - Executa testes
- `npm run lint` - Lint do código

## 💅 Estilo & Componentização
- **SCSS Modules**: estilos isolados por componente
- **Design System**: variáveis em `src/styles/variables.scss`
- **Breakpoints**: `src/styles/break-points.scss`
- **Componentes principais**:
  - `TasksPage`, `Card`, `TaskModal`, `Button`, `Search`

## 🔗 Integração
- Consome a API em `/tasks` (ajuste a URL se necessário)
- Todas as operações refletem no backend em tempo real

## 📝 Changelog
- Refatoração total para domínio de tarefas
- Tradução completa para português
- SCSS modular, responsivo e moderno
- Remoção de código legado
- Integração 100% com backend

## 🐞 Dicas de Solução de Problemas
- **Erro de CORS:** verifique se o backend está rodando na porta correta
- **API não responde:** confira a URL da API em `src/lib/api.ts`
- **Dependências:**
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

## 👨‍💻 Autor
Wedson Lima

---

**O céu é o limite! 🚀**