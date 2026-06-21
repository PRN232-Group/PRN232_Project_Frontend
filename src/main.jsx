import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import 'antd/dist/reset.css';
import { ConfigProvider } from 'antd';
import './index.css';
import { ToastContainer } from 'react-toastify';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider>
      <App />
      <ToastContainer />
    </ConfigProvider>
  </React.StrictMode>
);
