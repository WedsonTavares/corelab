/**
 * Interface da Tarefa - Representa uma tarefa completa com todos os campos
 */
export interface ITarefa {
  _id: string; // MongoDB usa _id ao invés de id
  id?: string; // Campo virtual para compatibilidade
  title: string;
  description: string;
  color: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface do Formulário de Tarefa - Para criação e edição
 */
export interface IFormularioTarefa {
  title: string;
  description: string;
  color: string;
  isFavorite?: boolean;
}

/**
 * Interface de Filtros - Para busca e filtragem de tarefas
 */
export interface IFiltrosTarefa {
  search?: string;
  favorite?: boolean;
  color?: string;
}

/**
 * Cores predefinidas para as tarefas
 */
export const CORES_TAREFA = {
  AZUL: '#BAE2FF',
  AMARELO: '#FFE4B5',
  VERDE: '#98FB98',
  ROSA: '#FFB6C1',
  ROXO: '#DDA0DD',
  LARANJA: '#FFDAB9',
  VERMELHO: '#FFA07A',
  CINZA: '#D3D3D3'
} as const

/**
 * Tipo para as cores disponíveis
 */
export type CorTarefa = typeof CORES_TAREFA[keyof typeof CORES_TAREFA]

/**
 * Interface de resposta da API
 */
export interface IRespostaAPI<T = ITarefa> {
  data?: T | T[];
  message?: string;
  error?: string;
}

// Backwards compatibility - mantém interfaces antigas para evitar quebras
export interface ITask extends ITarefa {}
export interface ITaskForm extends IFormularioTarefa {}
