import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerLicense } from '@syncfusion/ej2-base';
import App from './App.tsx'
import './index.css'

registerLicense(import.meta.env.VITE_SYNCFUSION_LICENSE_KEY);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
