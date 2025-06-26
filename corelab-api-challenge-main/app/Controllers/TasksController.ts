import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Tarefa from 'App/Models/Task'

/**
 * Controlador de Tarefas - Gerencia operações CRUD para tarefas
 * Suporta filtros por pesquisa, favoritos e cor
 * Ordenação automática: favoritos primeiro, depois por data de criação
 */
export default class ControladorTarefas {
  /**
   * Lista todas as tarefas com filtros opcionais
   * @param request - Requisição HTTP com query params
   * @param response - Resposta HTTP
   */
  public async index({ request, response }: HttpContextContract) {
    try {
      const { search, favorite, color } = request.qs()
      
      // Construir query de filtros
      let query: any = {}
      
      // Filtro de pesquisa
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      }
      
      // Filtro de favoritos
      if (favorite !== undefined) {
        query.isFavorite = favorite === 'true'
      }
      
      // Filtro de cor
      if (color) {
        query.color = color
      }
      
      // Buscar tarefas e ordenar por favoritos primeiro, depois por data de criação
      const tasks = await Tarefa.find(query).sort({ isFavorite: -1, createdAt: -1 })
      
      return response.json(tasks)
    } catch (erro) {
      console.error('❌ Erro ao buscar tarefas:', erro)
      return response.status(500).json({ 
        message: 'Falha ao buscar tarefas',
        error: erro.message 
      })
    }
  }

  /**
   * Busca uma tarefa específica por ID
   * @param params - Parâmetros da URL (id)
   * @param response - Resposta HTTP
   */
  public async show({ params, response }: HttpContextContract) {
    try {
      const task = await Tarefa.findById(params.id)
      
      if (!task) {
        return response.status(404).json({ message: 'Tarefa não encontrada' })
      }
      
      return response.json(task)
    } catch (erro) {
      console.error('❌ Erro ao buscar tarefa:', erro)
      return response.status(500).json({ 
        message: 'Falha ao buscar tarefa',
        error: erro.message 
      })
    }
  }

  /**
   * Cria uma nova tarefa
   * @param request - Requisição HTTP com dados da tarefa
   * @param response - Resposta HTTP
   */
  public async store({ request, response }: HttpContextContract) {
    try {
      const { title, description, color, isFavorite } = request.body()
      
      // Validações
      if (!title || !description) {
        return response.status(400).json({ 
          message: 'Título e descrição são obrigatórios' 
        })
      }
      
      if (title.length > 100) {
        return response.status(400).json({ 
          message: 'Título deve ter no máximo 100 caracteres' 
        })
      }
      
      if (description.length > 500) {
        return response.status(400).json({ 
          message: 'Descrição deve ter no máximo 500 caracteres' 
        })
      }
      
      const task = await Tarefa.create({
        title: title.trim(),
        description: description.trim(),
        color: color || '#BAE2FF',
        isFavorite: isFavorite || false
      })
      
      return response.status(201).json(task)
    } catch (erro) {
      console.error('❌ Erro ao criar tarefa:', erro)
      return response.status(500).json({ 
        message: 'Falha ao criar tarefa',
        error: erro.message 
      })
    }
  }

  /**
   * Atualiza uma tarefa existente
   * @param params - Parâmetros da URL (id)
   * @param request - Requisição HTTP com dados atualizados
   * @param response - Resposta HTTP
   */
  public async update({ params, request, response }: HttpContextContract) {
    try {
      const { title, description, color, isFavorite } = request.body()
      
      const task = await Tarefa.findById(params.id)
      
      if (!task) {
        return response.status(404).json({ message: 'Tarefa não encontrada' })
      }
      
      // Validações
      if (title && title.length > 100) {
        return response.status(400).json({ 
          message: 'Título deve ter no máximo 100 caracteres' 
        })
      }
      
      if (description && description.length > 500) {
        return response.status(400).json({ 
          message: 'Descrição deve ter no máximo 500 caracteres' 
        })
      }
      
      // Atualizar tarefa
      const updateData: any = {}
      if (title !== undefined) updateData.title = title.trim()
      if (description !== undefined) updateData.description = description.trim()
      if (color !== undefined) updateData.color = color
      if (isFavorite !== undefined) updateData.isFavorite = isFavorite
      
      const updatedTask = await Tarefa.findByIdAndUpdate(params.id, updateData, { new: true })
      
      return response.json(updatedTask)
    } catch (erro) {
      console.error('❌ Erro ao atualizar tarefa:', erro)
      return response.status(500).json({ 
        message: 'Falha ao atualizar tarefa',
        error: erro.message 
      })
    }
  }

  /**
   * Remove uma tarefa
   * @param params - Parâmetros da URL (id)
   * @param response - Resposta HTTP
   */
  public async destroy({ params, response }: HttpContextContract) {
    try {
      const task = await Tarefa.findByIdAndDelete(params.id)
      
      if (!task) {
        return response.status(404).json({ message: 'Tarefa não encontrada' })
      }
      
      return response.status(204).send('')
    } catch (erro) {
      console.error('❌ Erro ao deletar tarefa:', erro)
      return response.status(500).json({ 
        message: 'Falha ao deletar tarefa',
        error: erro.message 
      })
    }
  }

  /**
   * Alterna o status de favorito de uma tarefa
   * @param params - Parâmetros da URL (id)
   * @param response - Resposta HTTP
   */
  public async toggleFavorite({ params, response }: HttpContextContract) {
    try {
      const task = await Tarefa.findById(params.id)
      
      if (!task) {
        return response.status(404).json({ message: 'Tarefa não encontrada' })
      }
      
      const updatedTask = await Tarefa.findByIdAndUpdate(params.id, {
        isFavorite: !task.isFavorite
      }, { new: true })
      
      return response.json(updatedTask)
    } catch (erro) {
      console.error('❌ Erro ao alternar favorito:', erro)
      return response.status(500).json({ 
        message: 'Falha ao alternar favorito',
        error: erro.message 
      })
    }
  }
}
