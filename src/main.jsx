import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import 'antd/dist/reset.css';
import { ConfigProvider } from 'antd';
import './index.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const theme = {
  token: {
    colorPrimary: '#b0784f',
    colorLink: '#8a5b34',
    colorInfo: '#b0784f',
    colorSuccess: '#5f7d55',
    colorWarning: '#d19a3f',
    colorError: '#c8493c',
    colorText: '#2c2723',
    colorTextSecondary: '#4a423b',
    colorBorder: '#e7ded2',
    colorBgLayout: '#f7f4ef',
    borderRadius: 12,
    fontFamily:
      "'Poppins', system-ui, -apple-system, 'Segoe UI', sans-serif",
    controlHeight: 40,
  },
  components: {
    Button: { borderRadius: 999, controlHeight: 40, fontWeight: 600 },
    Menu: {
      darkItemBg: '#2c2723',
      darkSubMenuItemBg: '#241f1b',
      darkItemSelectedBg: '#b0784f',
      darkItemHoverBg: 'rgba(176,120,79,0.25)',
      darkItemColor: 'rgba(255,255,255,0.72)',
      itemSelectedColor: '#fff',
      itemBorderRadius: 10,
    },
    Table: { headerBg: '#f0e6da', headerColor: '#2c2723', borderRadius: 16 },
    Card: { borderRadiusLG: 20 },
  },
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider theme={theme}>
      <App />
      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
    </ConfigProvider>
  </React.StrictMode>
);
