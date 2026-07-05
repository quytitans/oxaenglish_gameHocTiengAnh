import axios from 'axios';

// BASE_URL carries the deployment subpath (e.g. "/oxaenglish/" in production,
// "/" in dev) so API calls stay correct wherever the app is mounted.
const api = axios.create({ baseURL: `${import.meta.env.BASE_URL}api` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
