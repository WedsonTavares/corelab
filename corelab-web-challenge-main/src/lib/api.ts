import { ITarefa, IFormularioTarefa, IFiltrosTarefa } from '../types/Task'

/**
 * Configuração da API - URL base do backend
 */
const API_BASE_URL = "http://localhost:3333"; // Backend com MongoDB

/**
 * Constrói o endpoint completo
 * @param path - Caminho da API
 * @returns URL completa
 */
const endpoint = (path: string): string => API_BASE_URL + path;

/**
 * Função genérica para fazer requisições HTTP
 * @param path - Caminho da API
 * @param options - Opções da requisição
 * @returns Promise com a resposta
 */
const request = async (path: string, options: RequestInit = {}): Promise<any> => {
  try {
    const response = await fetch(endpoint(path), {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        message: `Erro HTTP ${response.status}: ${response.statusText}` 
      }));
      throw new Error(error.message || `Falha na requisição HTTP ${response.status}`);
    }

    // Verificar se há conteúdo para analisar
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    return null; // Para respostas sem conteúdo (como 204)
  } catch (error) {
    console.error('❌ Erro na requisição API:', error);
    throw error;
  }
};

/**
 * Métodos HTTP auxiliares
 */
const get = async (path: string): Promise<any> => {
  return request(path, { method: 'GET' });
};

const post = async (path: string, data: any): Promise<any> => {
  return request(path, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

const put = async (path: string, data: any): Promise<any> => {
  return request(path, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

const del = async (path: string): Promise<any> => {
  return request(path, { method: 'DELETE' });
};

const patch = async (path: string, data: any = {}): Promise<any> => {
  return request(path, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

/**
 * Métodos da API de Tarefas
 */

/**
 * Busca todas as tarefas com filtros opcionais
 * @param filtros - Filtros para busca (pesquisa, favoritos, cor)
 * @returns Promise com array de tarefas
 */
export const buscarTarefas = async (filtros?: IFiltrosTarefa): Promise<ITarefa[]> => {
  const params = new URLSearchParams();
  
  if (filtros?.search) params.append('search', filtros.search);
  if (filtros?.favorite !== undefined) params.append('favorite', filtros.favorite.toString());
  if (filtros?.color) params.append('color', filtros.color);
  
  const query = params.toString() ? `?${params.toString()}` : '';
  return get(`/tasks${query}`);
};

/**
 * Busca uma tarefa específica por ID
 * @param id - ID da tarefa
 * @returns Promise com a tarefa encontrada
 */
export const buscarTarefa = async (id: string): Promise<ITarefa> => {
  return get(`/tasks/${id}`);
};

/**
 * Cria uma nova tarefa
 * @param tarefa - Dados da nova tarefa
 * @returns Promise com a tarefa criada
 */
export const criarTarefa = async (tarefa: IFormularioTarefa): Promise<ITarefa> => {
  return post('/tasks', tarefa);
};

/**
 * Atualiza uma tarefa existente
 * @param id - ID da tarefa
 * @param tarefa - Dados atualizados da tarefa
 * @returns Promise com a tarefa atualizada
 */
export const atualizarTarefa = async (id: string, tarefa: Partial<IFormularioTarefa>): Promise<ITarefa> => {
  return put(`/tasks/${id}`, tarefa);
};

/**
 * Remove uma tarefa
 * @param id - ID da tarefa
 * @returns Promise vazia
 */
export const removerTarefa = async (id: string): Promise<void> => {
  return del(`/tasks/${id}`);
};

/**
 * Alterna o status de favorito de uma tarefa
 * @param id - ID da tarefa
 * @returns Promise com a tarefa atualizada
 */
export const alternarFavorito = async (id: string): Promise<ITarefa> => {
  return patch(`/tasks/${id}/favorite`);
};

/**
 * Verifica se a API está funcionando
 * @returns Promise com status da API
 */
export const verificarStatusAPI = async (): Promise<any> => {
  return get('/');
};

// Backwards compatibility - mantém métodos antigos
export const getTasks = buscarTarefas;
export const getTask = buscarTarefa;
export const createTask = criarTarefa;
export const updateTask = atualizarTarefa;
export const deleteTask = removerTarefa;
export const toggleFavorite = alternarFavorito;
