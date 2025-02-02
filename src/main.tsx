import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { api } from '@/shared/api';

import App from './App.tsx';
import './index.css';

api.kanban.listLoadFx();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
