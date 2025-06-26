import React from 'react';
import styles from './Search.module.scss';

interface ISearch {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * Componente de busca com design moderno e responsivo
 * 
 * @param placeholder - Texto do placeholder
 * @param value - Valor atual da busca
 * @param onChange - Callback para mudanças no valor
 * @param disabled - Se o campo está desabilitado
 */
const Search: React.FC<ISearch> = ({ placeholder, value, onChange, disabled = false }) => {
  return (
    <div className={styles.searchContainer}>
      <input 
        type="text" 
        className={styles.searchInput}
        placeholder={placeholder} 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-label="Campo de busca"
      />
      <div className={styles.searchIcon} aria-hidden="true">
        🔍
      </div>
    </div>
  );
};

export default Search;
