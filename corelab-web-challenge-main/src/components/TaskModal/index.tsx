import React, { useState, useEffect } from 'react';
import { ITarefa, IFormularioTarefa, CORES_TAREFA } from '../../types/Task';
import Button from '../Button';
import styles from './TaskModal.module.scss';

interface ITaskModal {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: IFormularioTarefa) => void;
  task?: ITarefa;
}

/**
 * Modal para criação e edição de tarefas
 * Componente responsivo com validações em tempo real
 */
const TaskModal = ({ isOpen, onClose, onSave, task }: ITaskModal) => {
  const [formData, setFormData] = useState<IFormularioTarefa>({
    title: '',
    description: '',
    color: CORES_TAREFA.AZUL,
    isFavorite: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Atualiza o formulário quando uma tarefa é passada para edição
   */
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        color: task.color,
        isFavorite: task.isFavorite,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        color: CORES_TAREFA.AZUL,
        isFavorite: false,
      });
    }
    setErrors({});
  }, [task, isOpen]);

  /**
   * Valida os campos do formulário
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Título deve ter no máximo 100 caracteres';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Descrição deve ter no máximo 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Manipula mudanças nos inputs
   */
  const handleInputChange = (field: keyof IFormularioTarefa, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  /**
   * Submete o formulário
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim()
      });
      onClose();
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Fecha o modal
   */
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  /**
   * Manipula tecla ESC para fechar o modal
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, isSubmitting]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{task ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
          <button
            className={styles.closeButton}
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Campo Título */}
          <div className={styles.fieldGroup}>
            <label htmlFor="title" className={styles.label}>
              Título *
            </label>
            <input
              id="title"
              type="text"
              className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Digite o título da tarefa..."
              maxLength={100}
              disabled={isSubmitting}
              autoFocus
            />
            {errors.title && <span className={styles.errorText}>{errors.title}</span>}
            <div className={styles.charCount}>
              {formData.title.length}/100
            </div>
          </div>

          {/* Campo Descrição */}
          <div className={styles.fieldGroup}>
            <label htmlFor="description" className={styles.label}>
              Descrição *
            </label>
            <textarea
              id="description"
              className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descreva os detalhes da tarefa..."
              maxLength={500}
              rows={4}
              disabled={isSubmitting}
            />
            {errors.description && <span className={styles.errorText}>{errors.description}</span>}
            <div className={styles.charCount}>
              {formData.description.length}/500
            </div>
          </div>

          {/* Seletor de Cor */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Cor da Tarefa</label>
            <div className={styles.colorPicker}>
              {Object.entries(CORES_TAREFA).map(([nome, cor]) => (
                <button
                  key={cor}
                  type="button"
                  className={`${styles.colorOption} ${
                    formData.color === cor ? styles.colorSelected : ''
                  }`}
                  style={{ backgroundColor: cor }}
                  onClick={() => handleInputChange('color', cor)}
                  disabled={isSubmitting}
                  aria-label={`Selecionar cor ${nome.toLowerCase()}`}
                  title={nome.toLowerCase()}
                />
              ))}
            </div>
          </div>

          {/* Checkbox Favorito */}
          <div className={styles.fieldGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={formData.isFavorite}
                onChange={(e) => handleInputChange('isFavorite', e.target.checked)}
                disabled={isSubmitting}
              />
              <span className={styles.checkboxText}>
                ⭐ Marcar como favorita
              </span>
            </label>
          </div>

          {/* Botões de Ação */}
          <div className={styles.buttonGroup}>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : (task ? 'Atualizar' : 'Criar Tarefa')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
