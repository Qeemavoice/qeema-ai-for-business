import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {BrowserRouter} from 'react-router-dom';

const browserBaseName = window.location.pathname.startsWith('/new-ui') ? '/new-ui' : '/';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={browserBaseName}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
