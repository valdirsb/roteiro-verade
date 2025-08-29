import { createStore } from 'vuex';
import auth from './modules/auth';
import characters from './modules/characters';
import scripts from './modules/scripts';
import stats from './modules/stats';
import ui from './modules/ui';

export default createStore({
  state: {
    // Estado global da aplicação
    appName: 'Roteiro Verade',
    version: '1.0.0',
    isLoading: false,
    error: null,
    success: null
  },

  mutations: {
    SET_LOADING(state, loading) {
      state.isLoading = loading;
    },
    
    SET_ERROR(state, error) {
      state.error = error;
      state.success = null;
    },
    
    SET_SUCCESS(state, success) {
      state.success = success;
      state.error = null;
    },
    
    CLEAR_MESSAGES(state) {
      state.error = null;
      state.success = null;
    }
  },

  actions: {
    setLoading({ commit }, loading) {
      commit('SET_LOADING', loading);
    },
    
    setError({ commit }, error) {
      commit('SET_ERROR', error);
      
      // Limpar erro após 5 segundos
      setTimeout(() => {
        commit('CLEAR_MESSAGES');
      }, 5000);
    },
    
    setSuccess({ commit }, success) {
      commit('SET_SUCCESS', success);
      
      // Limpar sucesso após 3 segundos
      setTimeout(() => {
        commit('CLEAR_MESSAGES');
      }, 3000);
    },
    
    clearMessages({ commit }) {
      commit('CLEAR_MESSAGES');
    },
    
    // Ação global para fazer logout
    async logout({ dispatch }) {
      await dispatch('auth/logout');
      dispatch('characters/clearCharacters');
      dispatch('scripts/clearScripts');
      dispatch('ui/resetUI');
    },
    
    // Ação global para inicializar a aplicação
    async initializeApp({ dispatch }) {
      try {
        // Verificar se o usuário está autenticado
        const isAuthenticated = await dispatch('auth/checkAuth');
        
        if (isAuthenticated) {
          // Carregar dados iniciais
          await Promise.all([
            dispatch('characters/loadCharacters'),
            dispatch('scripts/loadScripts')
          ]);
        }
      } catch (error) {
        console.error('Erro ao inicializar aplicação:', error);
      }
    }
  },

  getters: {
    isLoading: state => state.isLoading,
    error: state => state.error,
    success: state => state.success,
    hasError: state => !!state.error,
    hasSuccess: state => !!state.success,
    appInfo: state => ({
      name: state.appName,
      version: state.version
    })
  },

  modules: {
    auth,
    characters,
    scripts,
    stats,
    ui
  }
}); 