import React from 'react';

interface ISearch {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const Search = ({ placeholder, value, onChange, disabled = false }: ISearch) => {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
      <input 
        type="text" 
        placeholder={placeholder} 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          padding: '16px 20px 16px 50px',
          border: '2px solid #e0e0e0',
          borderRadius: '12px',
          fontSize: '16px',
          width: '100%',
          background: disabled ? '#f5f5f5' : 'white',
          transition: 'all 0.3s ease',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          outline: 'none',
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? 'not-allowed' : 'text',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#007bff';
          e.target.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.1)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#e0e0e0';
          e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        }}
      />
      <div 
        style={{
          position: 'absolute',
          left: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '20px',
          color: '#999',
          pointerEvents: 'none'
        }}
      >
        🔍
      </div>
    </div>
  );
};

export default Search;
