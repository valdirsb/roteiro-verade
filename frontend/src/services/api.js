import axios from 'axios';

// Configuração base da API
// Se estiver rodando no Docker (porta 8081), usar proxy do nginx
// Caso contrário, usar a URL direta do backend
const isDockerEnvironment = window.location.port === '8081' || window.location.hostname === 'localhost' && window.location.port === '8081';
const API_BASE_URL = isDockerEnvironment 
  ? '/api' 
  : (import.meta.env.VITE_API_URL || 'http://localhost:3001/api');

// Criar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de respostas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Se o erro for 401 (não autorizado) e não for uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Tentar renovar o token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken
          });

          if (response.data.success) {
            const { access_token, refresh_token } = response.data.data;
            localStorage.setItem('accessToken', access_token);
            localStorage.setItem('refreshToken', refresh_token);
            
            // Reenviar a requisição original com o novo token
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return api(originalRequest);
          }
        }
      } catch {
        // Se falhar ao renovar, limpar tokens e redirecionar para login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Emitir evento para o app saber que precisa redirecionar
        // Apenas se não estivermos já fazendo logout
        if (!window.isLoggingOut) {
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
      }
    }

    return Promise.reject(error);
  }
);

// Funções utilitárias para tratamento de erros
export const handleApiError = (error) => {
  if (error.response) {
    // Erro do servidor
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return {
          type: 'validation',
          message: data.error || 'Dados inválidos',
          details: data.details || []
        };
      case 401:
        return {
          type: 'auth',
          message: 'Sessão expirada. Faça login novamente.'
        };
      case 403:
        return {
          type: 'permission',
          message: 'Acesso negado. Você não tem permissão para esta ação.'
        };
      case 404:
        return {
          type: 'not_found',
          message: 'Recurso não encontrado.'
        };
      case 409:
        return {
          type: 'conflict',
          message: data.error || 'Conflito de dados.'
        };
      case 422:
        return {
          type: 'validation',
          message: data.error || 'Dados inválidos',
          details: data.details || []
        };
      case 500:
        return {
          type: 'server',
          message: 'Erro interno do servidor. Tente novamente mais tarde.'
        };
      default:
        return {
          type: 'unknown',
          message: data.error || 'Erro desconhecido.'
        };
    }
  } else if (error.request) {
    // Erro de rede
    return {
      type: 'network',
      message: 'Erro de conexão. Verifique sua internet.'
    };
  } else {
    // Erro de configuração
    return {
      type: 'config',
      message: 'Erro de configuração.'
    };
  }
};

// Função para fazer requisições com tratamento de erro
export const apiRequest = async (config) => {
  try {
    const response = await api(config);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: handleApiError(error)
    };
  }
};

// Funções HTTP básicas
export const apiGet = (url, config = {}) => apiRequest({ method: 'GET', url, ...config });
export const apiPost = (url, data = {}, config = {}) => apiRequest({ method: 'POST', url, data, ...config });
export const apiPut = (url, data = {}, config = {}) => apiRequest({ method: 'PUT', url, data, ...config });
export const apiPatch = (url, data = {}, config = {}) => apiRequest({ method: 'PATCH', url, data, ...config });
export const apiDelete = (url, config = {}) => apiRequest({ method: 'DELETE', url, ...config });

// Função para upload de arquivos
export const apiUpload = (url, file, config = {}) => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  return apiRequest({
    method: 'POST',
    url,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    ...config
  });
};

// Função para verificar se o usuário está autenticado
export const isAuthenticated = () => {
  const token = localStorage.getItem('accessToken');
  return !!token;
};

// Função para obter dados do usuário
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Função para fazer logout
export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  
  // Apenas disparar evento se não estivermos já fazendo logout
  if (!window.isLoggingOut) {
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }
};

export default api; 