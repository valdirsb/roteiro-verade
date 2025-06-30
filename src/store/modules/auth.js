import authService from '@/services/authService';

export default {
  namespaced: true,
  
  state: {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  },

  mutations: {
    SET_USER(state, user) {
      state.user = user;
      state.isAuthenticated = !!user;
    },
    
    SET_LOADING(state, loading) {
      state.isLoading = loading;
    },
    
    SET_ERROR(state, error) {
      state.error = error;
    },
    
    CLEAR_ERROR(state) {
      state.error = null;
    },
    
    CLEAR_AUTH(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    }
  },

  actions: {
    // Login do usuário
    async login({ commit, dispatch }, { email, password }) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');
      
      try {
        const response = await authService.login(email, password);
        
        if (response.success) {
          commit('SET_USER', response.user);
          dispatch('setSuccess', 'Login realizado com sucesso!', { root: true });
          return { success: true };
        } else {
          commit('SET_ERROR', response.error);
          return { success: false, error: response.error };
        }
      } catch {
        const errorMessage = 'Erro ao fazer login. Tente novamente.';
        commit('SET_ERROR', { type: 'unknown', message: errorMessage });
        return { success: false, error: { type: 'unknown', message: errorMessage } };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Registro de novo usuário
    async register({ commit, dispatch }, userData) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');
      
      try {
        const response = await authService.register(userData);
        
        if (response.success) {
          commit('SET_USER', response.user);
          dispatch('setSuccess', 'Conta criada com sucesso!', { root: true });
          return { success: true };
        } else {
          commit('SET_ERROR', response.error);
          return { success: false, error: response.error };
        }
      } catch {
        const errorMessage = 'Erro ao criar conta. Tente novamente.';
        commit('SET_ERROR', { type: 'unknown', message: errorMessage });
        return { success: false, error: { type: 'unknown', message: errorMessage } };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Logout do usuário
    async logout({ commit, dispatch }) {
      commit('SET_LOADING', true);
      
      try {
        await authService.logout();
        commit('CLEAR_AUTH');
        dispatch('setSuccess', 'Logout realizado com sucesso!', { root: true });
      } catch {
        console.error('Erro ao fazer logout');
        // Mesmo com erro, limpar dados locais
        commit('CLEAR_AUTH');
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Verificar autenticação
    async checkAuth({ commit }) {
      const isAuthenticated = authService.isAuthenticated();
      
      if (isAuthenticated) {
        const user = authService.getCurrentUser();
        
        if (user) {
          commit('SET_USER', user);
          
          // Verificar se o token ainda é válido
          try {
            const isValid = await authService.verifyToken();
            if (!isValid) {
              commit('CLEAR_AUTH');
              return false;
            }
            return true;
          } catch {
            commit('CLEAR_AUTH');
            return false;
          }
        } else {
          commit('CLEAR_AUTH');
          return false;
        }
      } else {
        commit('CLEAR_AUTH');
        return false;
      }
    },

    // Atualizar perfil do usuário
    async updateProfile({ commit, dispatch }, userData) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');
      
      try {
        const response = await authService.updateProfile(userData);
        
        if (response.success) {
          commit('SET_USER', response.user);
          dispatch('setSuccess', 'Perfil atualizado com sucesso!', { root: true });
          return { success: true };
        } else {
          commit('SET_ERROR', response.error);
          return { success: false, error: response.error };
        }
      } catch {
        const errorMessage = 'Erro ao atualizar perfil. Tente novamente.';
        commit('SET_ERROR', { type: 'unknown', message: errorMessage });
        return { success: false, error: { type: 'unknown', message: errorMessage } };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Alterar senha
    async changePassword({ commit, dispatch }, { currentPassword, newPassword }) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');
      
      try {
        const response = await authService.changePassword(currentPassword, newPassword);
        
        if (response.success) {
          dispatch('setSuccess', 'Senha alterada com sucesso!', { root: true });
          return { success: true };
        } else {
          commit('SET_ERROR', response.error);
          return { success: false, error: response.error };
        }
      } catch {
        const errorMessage = 'Erro ao alterar senha. Tente novamente.';
        commit('SET_ERROR', { type: 'unknown', message: errorMessage });
        return { success: false, error: { type: 'unknown', message: errorMessage } };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Solicitar redefinição de senha
    async forgotPassword({ commit, dispatch }, email) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');
      
      try {
        const response = await authService.forgotPassword(email);
        
        if (response.success) {
          dispatch('setSuccess', 'Email de redefinição enviado!', { root: true });
          return { success: true };
        } else {
          commit('SET_ERROR', response.error);
          return { success: false, error: response.error };
        }
      } catch {
        const errorMessage = 'Erro ao solicitar redefinição. Tente novamente.';
        commit('SET_ERROR', { type: 'unknown', message: errorMessage });
        return { success: false, error: { type: 'unknown', message: errorMessage } };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Redefinir senha
    async resetPassword({ commit, dispatch }, { token, newPassword }) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');
      
      try {
        const response = await authService.resetPassword(token, newPassword);
        
        if (response.success) {
          dispatch('setSuccess', 'Senha redefinida com sucesso!', { root: true });
          return { success: true };
        } else {
          commit('SET_ERROR', response.error);
          return { success: false, error: response.error };
        }
      } catch {
        const errorMessage = 'Erro ao redefinir senha. Tente novamente.';
        commit('SET_ERROR', { type: 'unknown', message: errorMessage });
        return { success: false, error: { type: 'unknown', message: errorMessage } };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Limpar erro
    clearError({ commit }) {
      commit('CLEAR_ERROR');
    }
  },

  getters: {
    user: state => state.user,
    isAuthenticated: state => state.isAuthenticated,
    isLoading: state => state.isLoading,
    error: state => state.error,
    hasError: state => !!state.error,
    
    // Permissões do usuário
    userPermissions: state => {
      if (!state.user) return [];
      return state.user.roles || [];
    },
    
    // Verificar se tem permissão específica
    hasPermission: (state, getters) => (permission) => {
      return getters.userPermissions.includes(permission);
    },
    
    // Verificar se tem role específica
    hasRole: (state, getters) => (role) => {
      return getters.userPermissions.includes(role);
    },
    
    // Verificar se é admin
    isAdmin: (state, getters) => {
      return getters.hasRole('admin');
    },
    
    // Verificar se é editor
    isEditor: (state, getters) => {
      return getters.hasRole('editor') || getters.hasRole('admin');
    },
    
    // Verificar se é viewer
    isViewer: (state, getters) => {
      return getters.hasRole('viewer') || getters.hasRole('editor') || getters.hasRole('admin');
    },
    
    // Nome do usuário
    userName: state => {
      return state.user ? state.user.username : '';
    },
    
    // Email do usuário
    userEmail: state => {
      return state.user ? state.user.email : '';
    }
  }
}; 