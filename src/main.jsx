import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App.jsx';
import 'antd/dist/reset.css';
import { ConfigProvider } from 'antd';
import './index.css';
import './styles/components.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/*
 * When there is no backend, unmatched /api requests fall through to the SPA
 * and resolve with the index.html document (a string). That defeats guards
 * like `res.data || []` and crashes pages that call `.map` or feed AntD tables.
 * Reject any HTML response so every page's existing catch block runs and
 * state stays at its safe initial value.
 */
axios.interceptors.response.use(
  (response) => {
    const contentType = response?.headers?.["content-type"] || "";
    const data = response?.data;
    const looksLikeHtml =
      typeof data === "string" &&
      (contentType.includes("text/html") || data.trimStart().startsWith("<"));
    if (looksLikeHtml) {
      return Promise.reject(new Error("Backend unavailable (received HTML)."));
    }
    return response;
  },
  (error) => Promise.reject(error)
);

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
