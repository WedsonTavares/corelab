import React, { useEffect, useState, useCallback, useMemo } from "react";
import { 
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleFavorite
} from "../../lib/api";
import { Button, Card, Search, TaskModal } from "../../components";
import styles from "./Tasks.module.scss";
import { ITarefa, IFormularioTarefa, CORES_TAREFA } from "../../types/Task";

/**
 * Página principal de gerenciamento de tarefas
 * 
 * Esta página oferece funcionalidades completas para:
 * - Visualizar todas as tarefas em um grid responsivo
 * - Filtrar tarefas por texto, favoritos e cor
 * - Criar, editar e excluir tarefas
 * - Marcar/desmarcar tarefas como favoritas
 * 
 * @returns {JSX.Element} Componente da página de tarefas
 */
const TasksPage: React.FC = () => {
  // Estados principais
  const [tasks, setTasks] = useState<ITarefa[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<ITarefa[]>([]);
  const [search, setSearch] = useState<string>("");
  const [filterFavorites, setFilterFavorites] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  
  // Estados do modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<ITarefa | undefined>();

  // Cores disponíveis para as tarefas (memoizado para performance)
  const availableColors = useMemo(() => Object.keys(CORES_TAREFA), []);

  /**
   * Busca tarefas da API com tratamento de erro e normaliza o campo id
   */
  const fetchTasks = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError("");
      // Busca tarefas já com filtros aplicados no backend
      const fetchedTasks = await getTasks({
        search,
        favorite: filterFavorites,
        color: selectedColor
      });
      // Normaliza o campo id para cada tarefa
      const normalized = fetchedTasks.map((task: ITarefa) => ({
        ...task,
        id: task.id || task._id
      }));
      setTasks(normalized);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
      setError("Não foi possível carregar as tarefas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [search, filterFavorites, selectedColor]);

  /**
   * Busca inicial das tarefas e sempre que filtros mudam
   */
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  /**
   * Handlers para modal
   */
  const handleOpenModal = useCallback((task?: ITarefa): void => {
    setEditingTask(task);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback((): void => {
    setIsModalOpen(false);
    setEditingTask(undefined);
  }, []);

  /**
   * Salva uma tarefa (criação ou edição)
   */
  const handleSaveTask = useCallback(async (taskData: IFormularioTarefa): Promise<void> => {
    try {
      setLoading(true);
      setError("");

      if (editingTask && editingTask.id) {
        // Editando tarefa existente
        const updatedTask = await updateTask(editingTask.id, taskData);
        setTasks(prev => prev.map(task => 
          task.id === editingTask.id ? updatedTask : task
        ));
      } else {
        // Criando nova tarefa
        const newTask = await createTask(taskData);
        setTasks(prev => [newTask, ...prev]);
      }

      handleCloseModal();
    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
      setError("Não foi possível salvar a tarefa. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [editingTask, handleCloseModal]);

  /**
   * Exclui uma tarefa
   */
  const handleDeleteTask = useCallback(async (taskId: string): Promise<void> => {
    if (!window.confirm("Tem certeza de que deseja excluir esta tarefa?")) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      await deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
      setError("Não foi possível excluir a tarefa. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Alterna o status de favorito de uma tarefa
   */
  const handleToggleFavorite = useCallback(async (taskId: string): Promise<void> => {
    try {
      const updatedTask = await toggleFavorite(taskId);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
    } catch (error) {
      console.error("Erro ao alterar favorito:", error);
      setError("Não foi possível alterar o status de favorito.");
    }
  }, []);

  /**
   * Handlers para filtros
   */
  const handleSearchChange = useCallback((value: string): void => {
    setSearch(value);
  }, []);

  const handleFavoriteFilterChange = useCallback((): void => {
    setFilterFavorites(prev => !prev);
  }, []);

  const handleColorFilterChange = useCallback((color: string): void => {
    setSelectedColor(color === selectedColor ? "" : color);
  }, [selectedColor]);

  const handleClearError = useCallback((): void => {
    setError("");
  }, []);

  /**
   * Renderiza o estado vazio quando não há tarefas
   */
  const renderEmptyState = (): JSX.Element => (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>📝</div>
      <h3 className={styles.emptyTitle}>
        {search || filterFavorites || selectedColor 
          ? "Nenhuma tarefa encontrada" 
          : "Nenhuma tarefa cadastrada"
        }
      </h3>
      <p className={styles.emptyDescription}>
        {search || filterFavorites || selectedColor 
          ? "Tente ajustar os filtros para encontrar suas tarefas."
          : "Comece criando sua primeira tarefa clicando no botão abaixo."
        }
      </p>
      {!search && !filterFavorites && !selectedColor && (
        <Button
          variant="primary"
          onClick={() => handleOpenModal()}
        >
          ✨ Criar minha primeira tarefa
        </Button>
      )}
    </div>
  );

  /**
   * Renderiza o estado de carregamento
   */
  const renderLoadingState = (): JSX.Element => (
    <div className={styles.loadingState}>
      <div className={styles.loadingSpinner} />
    </div>
  );

  return (
    <div className={styles.tasksPage}>
      {/* Cabeçalho */}
      <header className={styles.header}>
        <h1 className={styles.title}>CoreNotes</h1>
        <p className={styles.subtitle}>
          Organize suas tarefas de forma simples e eficiente
        </p>
      </header>

      <main className={styles.main}>
        {/* Mensagem de erro */}
        {error && (
          <div className={styles.error}>
            <span className={styles.errorMessage}>{error}</span>
            <button 
              className={styles.closeButton}
              onClick={handleClearError}
            >
              ×
            </button>
          </div>
        )}

        {/* Controles de busca e filtros */}
        <section className={styles.controls}>
          <div className={styles.searchSection}>
            <Search
              value={search}
              onChange={handleSearchChange}
              placeholder="Buscar tarefas por título ou descrição..."
            />
          </div>

          <div className={styles.filtersAndActions}>
            {/* Filtros */}
            <div className={styles.filters}>
              {/* Filtro de favoritos */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Filtros</label>
                <div className={styles.filterOptions}>
                  <label className={styles.favoriteFilter}>
                    <input
                      type="checkbox"
                      checked={filterFavorites}
                      onChange={handleFavoriteFilterChange}
                    />
                    <span>Apenas favoritas</span>
                  </label>
                </div>
              </div>

              {/* Filtro de cores */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Cores</label>
                <div className={styles.colorFilter}>
                  <button
                    className={`${styles.colorOption} ${styles.all} ${!selectedColor ? styles.selected : ''}`}
                    onClick={() => handleColorFilterChange("")}
                    title="Mostrar todas as cores"
                  />
                  {availableColors.map(color => (
                    <button
                      key={color}
                      className={`${styles.colorOption} ${selectedColor === color ? styles.selected : ''}`}
                      style={{ backgroundColor: CORES_TAREFA[color as keyof typeof CORES_TAREFA] }}
                      onClick={() => handleColorFilterChange(color)}
                      title={`Filtrar por cor ${color}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Botão de adicionar tarefa - versão desktop */}
            <Button
              variant="primary"
              onClick={() => handleOpenModal()}
              disabled={loading}
            >
              ➕ Nova tarefa
            </Button>
          </div>
        </section>

        {/* Lista de tarefas */}
        <section>
          {loading ? (
            renderLoadingState()
          ) : tasks.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className={styles.tasksGrid}>
              {tasks.map((task) => (
                <Card
                  key={task.id || task._id}
                  task={task}
                  onEdit={() => handleOpenModal(task)}
                  onDelete={() => handleDeleteTask(task.id || task._id)}
                  onToggleFavorite={() => handleToggleFavorite(task.id || task._id)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Botão flutuante para adicionar tarefa - versão mobile */}
      <div className={styles.addButton}>
        <Button
          variant="primary"
          onClick={() => handleOpenModal()}
          disabled={loading}
        >
          ➕
        </Button>
      </div>

      {/* Modal de tarefa */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        task={editingTask}
      />
    </div>
  );
};

export default TasksPage;
