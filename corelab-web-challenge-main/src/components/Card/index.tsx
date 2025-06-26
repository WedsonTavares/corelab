import React from 'react';
import styles from './Card.module.scss';
import { ITarefa, CORES_TAREFA } from '../../types/Task';

/**
 * Interface das props do componente Card
 */
export interface ICard {
  task: ITarefa;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

/**
 * Componente Card - Exibe uma tarefa individual
 * 
 * @param task - Dados da tarefa
 * @param onEdit - Callback para editar a tarefa
 * @param onDelete - Callback para excluir a tarefa
 * @param onToggleFavorite - Callback para alternar favorito
 */
const Card: React.FC<ICard> = ({
  task,
  onEdit,
  onDelete,
  onToggleFavorite
}) => {
  /**
   * Formata a data de criação da tarefa
   */
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Data inválida';
    }
  };

  /**
   * Obtém a cor da tarefa
   */
  const getTaskColor = (): string => {
    return CORES_TAREFA[task.color as keyof typeof CORES_TAREFA] || CORES_TAREFA.AZUL;
  };

  /**
   * Verifica se a tarefa está vazia (sem título e descrição)
   */
  const isEmpty = !task.title?.trim() && !task.description?.trim();

  return (
    <article 
      className={`${styles.card} ${isEmpty ? styles.isEmpty : ''}`}
      style={{ '--task-color': getTaskColor() } as React.CSSProperties}
      aria-label={`Tarefa: ${task.title || 'Sem título'}`}
    >
      {/* Cabeçalho com título e botão de favorito */}
      <header className={styles.header}>
        <h3 className={styles.title}>
          {task.title || 'Sem título'}
        </h3>
        
        <button
          className={`${styles.favoriteBtn} ${task.isFavorite ? styles.isFavorite : ''}`}
          onClick={onToggleFavorite}
          aria-label={task.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          title={task.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          {task.isFavorite ? '⭐' : '☆'}
        </button>
      </header>

      {/* Conteúdo da tarefa */}
      <div className={styles.content}>
        {task.description && (
          <p className={styles.description}>
            {task.description}
          </p>
        )}
        
        {/* Indicador de cor */}
        <div className={styles.colorIndicator}>
          <span className={styles.colorLabel}>Cor:</span>
          <div 
            className={styles.colorSwatch}
            style={{ backgroundColor: getTaskColor() }}
            title={`Cor: ${task.color}`}
          />
        </div>
      </div>

      {/* Ações */}
      <footer className={styles.actions}>
        <button
          className={`${styles.actionBtn} ${styles.editBtn}`}
          onClick={onEdit}
          aria-label="Editar tarefa"
          title="Editar tarefa"
        >
          ✏️
        </button>
        
        <button
          className={`${styles.actionBtn} ${styles.deleteBtn}`}
          onClick={onDelete}
          aria-label="Excluir tarefa"
          title="Excluir tarefa"
        >
          🗑️
        </button>
      </footer>

      {/* Data de criação */}
      {task.createdAt && (
        <div className={styles.createdAt}>
          Criado em: {formatDate(task.createdAt)}
        </div>
      )}
    </article>
  );
};

export default Card;
