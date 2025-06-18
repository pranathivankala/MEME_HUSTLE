import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { MemeProvider } from './context/MemeContext';
import './index.css'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MemeProvider>
      <App />
    </MemeProvider>
  </React.StrictMode>
);
