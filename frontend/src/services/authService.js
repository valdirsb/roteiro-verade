import { apiPost, apiGet, isAuthenticated, getCurrentUser, logout } from './api.js';

class AuthService {
  // Login do usuário
  async login(username, password) {
    const response = await apiPost('/auth/login', {
      username,
      password
    });

    if (response.success) {
      // Corrigir para acessar response.data.data
      const { accessToken, refreshToken, user } = response.data.data;
      
      // Salvar tokens e dados do usuário
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      return {
        success: true,
        user
      };
    }

    return response;
  }

  // Registro de novo usuário
  async register(userData) {
    const response = await apiPost('/auth/register', userData);
    
    if (response.success) {
      const { access_token, refresh_token, user } = response.data;
      
      // Salvar tokens e dados do usuário
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return {
        success: true,
        user
      };
    }

    return response;
  }

  // Logout do usuário
  async logout() {
    try {
      // Tentar invalidar o token no servidor
      await apiPost('/auth/logout');
    } catch (error) {
      // Se falhar, continuar com o logout local
      console.warn('Erro ao fazer logout no servidor:', error);
    } finally {
      // Sempre limpar dados locais
      logout();
    }
  }

  // Verificar se está autenticado
  isAuthenticated() {
    return isAuthenticated();
  }

  // Obter usuário atual
  getCurrentUser() {
    return getCurrentUser();
  }

  // Atualizar perfil do usuário
  async updateProfile(userData) {
    const response = await apiPost('/auth/profile', userData);
    
    if (response.success) {
      // Atualizar dados do usuário no localStorage
      const updatedUser = response.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return {
        success: true,
        user: updatedUser
      };
    }

    return response;
  }

  // Alterar senha
  async changePassword(currentPassword, newPassword) {
    return await apiPost('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword
    });
  }

  // Solicitar redefinição de senha
  async forgotPassword(email) {
    return await apiPost('/auth/forgot-password', { email });
  }

  // Redefinir senha com token
  async resetPassword(token, newPassword) {
    return await apiPost('/auth/reset-password', {
      token,
      new_password: newPassword
    });
  }

  // Verificar se o token é válido
  async verifyToken() {
    try {
      const response = await apiGet('/auth/verify');
      return response.success;
    } catch {
      return false;
    }
  }

  // Obter permissões do usuário
  getUserPermissions() {
    const user = getCurrentUser();
    if (!user) return [];
    
    return user.roles || [];
  }

  // Verificar se usuário tem permissão específica
  hasPermission(permission) {
    const permissions = this.getUserPermissions();
    return permissions.includes(permission);
  }

  // Verificar se usuário tem role específica
  hasRole(role) {
    const user = getCurrentUser();
    if (!user) return false;
    
    return user.roles && user.roles.includes(role);
  }

  // Verificar se é admin
  isAdmin() {
    return this.hasRole('admin');
  }

  // Verificar se é editor
  isEditor() {
    return this.hasRole('editor') || this.hasRole('admin');
  }

  // Verificar se é viewer
  isViewer() {
    return this.hasRole('viewer') || this.hasRole('editor') || this.hasRole('admin');
  }
}

export default new AuthService(); 