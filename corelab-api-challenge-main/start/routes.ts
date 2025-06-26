/*
|--------------------------------------------------------------------------
| Rotas
|--------------------------------------------------------------------------
|
| Este arquivo é dedicado para definir rotas HTTP. Um único arquivo é suficiente
| para a maioria dos projetos, no entanto você pode definir rotas em arquivos
| diferentes e apenas certifique-se de importá-los dentro deste arquivo.
|
*/

import Route from '@ioc:Adonis/Core/Route'

/**
 * Rota de saúde da API - para verificar se o servidor está funcionando
 */
Route.get('/', async ({ response }) => {
  return response.json({
    message: 'API Corelab Task Manager funcionando!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
})

/**
 * Rotas de Tarefas - CRUD completo + funcionalidades especiais
 */
Route.group(() => {
  Route.get('/', 'TasksController.index')           // GET /tarefas - Listar tarefas (com filtros)
  Route.get('/:id', 'TasksController.show')         // GET /tarefas/:id - Buscar tarefa específica
  Route.post('/', 'TasksController.store')          // POST /tarefas - Criar nova tarefa
  Route.put('/:id', 'TasksController.update')       // PUT /tarefas/:id - Atualizar tarefa
  Route.delete('/:id', 'TasksController.destroy')   // DELETE /tarefas/:id - Deletar tarefa
  Route.patch('/:id/favorito', 'TasksController.toggleFavorite') // PATCH /tarefas/:id/favorito - Alternar favorito
}).prefix('/tarefas')

/**
 * Rotas de compatibilidade com frontend existente
 */
Route.group(() => {
  Route.get('/', 'TasksController.index')
  Route.get('/:id', 'TasksController.show')
  Route.post('/', 'TasksController.store')
  Route.put('/:id', 'TasksController.update')
  Route.delete('/:id', 'TasksController.destroy')
  Route.patch('/:id/favorite', 'TasksController.toggleFavorite')
}).prefix('/tasks')
