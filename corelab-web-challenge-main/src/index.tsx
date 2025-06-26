import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.module.scss';
import TasksPage from './pages/Tasks';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <TasksPage />
  </React.StrictMode>
);

// Se você quiser começar a medir a performance em seu aplicativo, passe uma função
// para registrar resultados (por exemplo: reportWebVitals(console.log))
// ou envie para um endpoint de analytics. Saiba mais: https://bit.ly/CRA-vitals
reportWebVitals();
