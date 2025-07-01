import statsService from '@/services/statsService';

export default {
  namespaced: true,

  state: {
    globalStats: null,
    scriptStats: null,
    characterStats: null,
    shareStats: null,
    recentScripts: [],
    isLoading: false,
    error: null,
    lastUpdated: null
  },

  mutations: {
    SET_GLOBAL_STATS(state, stats) {
      state.globalStats = stats;
    },

    SET_SCRIPT_STATS(state, stats) {
      state.scriptStats = stats;
    },

    SET_CHARACTER_STATS(state, stats) {
      state.characterStats = stats;
    },

    SET_SHARE_STATS(state, stats) {
      state.shareStats = stats;
    },

    SET_RECENT_SCRIPTS(state, scripts) {
      state.recentScripts = scripts;
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

    SET_LAST_UPDATED(state, timestamp) {
      state.lastUpdated = timestamp;
    },

    CLEAR_STATS(state) {
      state.globalStats = null;
      state.scriptStats = null;
      state.characterStats = null;
      state.shareStats = null;
      state.recentScripts = [];
      state.error = null;
      state.lastUpdated = null;
    }
  },

  actions: {
    // Carregar estatísticas globais
    async loadGlobalStats({ commit }) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');

      try {
        const response = await statsService.getGlobalStats();

        if (response.success) {
          commit('SET_GLOBAL_STATS', response.data.data);
          commit('SET_LAST_UPDATED', new Date().toISOString());
          return { success: true };
        } else {
          commit('SET_ERROR', response.error);
          return { success: false, error: response.error };
        }
      } catch {
        const errorMessage = 'Erro ao carregar estatísticas globais.';
        commit('SET_ERROR', { type: 'unknown', message: errorMessage });
        return { success: false, error: { type: 'unknown', message: errorMessage } };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Carregar estatísticas de roteiros
    async loadScriptStats({ commit }) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');

      try {
        const response = await statsService.getScriptStats();

        if (response.success) {
          commit('SET_SCRIPT_STATS', response.data.data);
          commit('SET_LAST_UPDATED', new Date().toISOString());
          return { success: true };
        } else {
          commit('SET_ERROR', response.error);
          return { success: false, error: response.error };
        }
      } catch {
        const errorMessage = 'Erro ao carregar estatísticas de roteiros.';
        commit('SET_ERROR', { type: 'unknown', message: errorMessage });
        return { success: false, error: { type: 'unknown', message: errorMessage } };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Carregar estatísticas de personagens
    async loadCharacterStats({ commit }) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');

      try {
        const response = await statsService.getCharacterStats();

        if (response.success) {
          commit('SET_CHARACTER_STATS', response.data.data);
          commit('SET_LAST_UPDATED', new Date().toISOString());
          return { success: true };
        } else {
          commit('SET_ERROR', response.error);
          return { success: false, error: response.error };
        }
      } catch {
        const errorMessage = 'Erro ao carregar estatísticas de personagens.';
        commit('SET_ERROR', { type: 'unknown', message: errorMessage });
        return { success: false, error: { type: 'unknown', message: errorMessage } };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Carregar estatísticas de compartilhamentos
    async loadShareStats({ commit }) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');

      try {
        const response = await statsService.getShareStats();

        if (response.success) {
          commit('SET_SHARE_STATS', response.data.data);
          commit('SET_LAST_UPDATED', new Date().toISOString());
          return { success: true };
        } else {
          commit('SET_ERROR', response.error);
          return { success: false, error: response.error };
        }
      } catch {
        const errorMessage = 'Erro ao carregar estatísticas de compartilhamentos.';
        commit('SET_ERROR', { type: 'unknown', message: errorMessage });
        return { success: false, error: { type: 'unknown', message: errorMessage } };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Carregar roteiros recentes
    async loadRecentScripts({ commit }, limit = 5) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');

      try {
        const response = await statsService.getRecentScripts(limit);

        if (response.success) {
          commit('SET_RECENT_SCRIPTS', response.data.data.scripts);
          commit('SET_LAST_UPDATED', new Date().toISOString());
          return { success: true };
        } else {
          commit('SET_ERROR', response.error);
          return { success: false, error: response.error };
        }
      } catch {
        const errorMessage = 'Erro ao carregar roteiros recentes.';
        commit('SET_ERROR', { type: 'unknown', message: errorMessage });
        return { success: false, error: { type: 'unknown', message: errorMessage } };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Carregar dados completos do dashboard
    async loadDashboardData({ commit }) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');

      try {
        const response = await statsService.getDashboardData();

        if (response.success) {
          if (response.data.stats) {
            commit('SET_GLOBAL_STATS', response.data.data.stats);
          }
          if (response.data.recentScripts) {
            commit('SET_RECENT_SCRIPTS', response.data.recentScripts);
          }
          commit('SET_LAST_UPDATED', new Date().toISOString());
          return { success: true };
        } else {
          commit('SET_ERROR', response.error);
          return { success: false, error: response.error };
        }
      } catch {
        const errorMessage = 'Erro ao carregar dados do dashboard.';
        commit('SET_ERROR', { type: 'unknown', message: errorMessage });
        return { success: false, error: { type: 'unknown', message: errorMessage } };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Carregar todas as estatísticas
    async loadAllStats({ commit }) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');

      try {
        const [globalStats, scriptStats, characterStats, shareStats, recentScripts] = await Promise.all([
          statsService.getGlobalStats(),
          statsService.getScriptStats(),
          statsService.getCharacterStats(),
          statsService.getShareStats(),
          statsService.getRecentScripts(5)
        ]);

        if (globalStats.success) {
          commit('SET_GLOBAL_STATS', globalStats.data.data);
        }
        if (scriptStats.success) {
          commit('SET_SCRIPT_STATS', scriptStats.data.data);
        }
        if (characterStats.success) {
          commit('SET_CHARACTER_STATS', characterStats.data.data);
        }
        if (shareStats.success) {
          commit('SET_SHARE_STATS', shareStats.data.data);
        }
        if (recentScripts.success) {
          commit('SET_RECENT_SCRIPTS', recentScripts.data.data.scripts);
        }

        commit('SET_LAST_UPDATED', new Date().toISOString());
        return { success: true };
      } catch {
        const errorMessage = 'Erro ao carregar todas as estatísticas.';
        commit('SET_ERROR', { type: 'unknown', message: errorMessage });
        return { success: false, error: { type: 'unknown', message: errorMessage } };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Limpar estatísticas
    clearStats({ commit }) {
      commit('CLEAR_STATS');
    },

    // Limpar erro
    clearError({ commit }) {
      commit('CLEAR_ERROR');
    }
  },

  getters: {
    globalStats: state => state.globalStats,
    scriptStats: state => state.scriptStats,
    characterStats: state => state.characterStats,
    shareStats: state => state.shareStats,
    recentScripts: state => state.recentScripts,
    isLoading: state => state.isLoading,
    error: state => state.error,
    hasError: state => !!state.error,
    lastUpdated: state => state.lastUpdated,

    // Contadores do dashboard
    scriptsCount: (state) => {
      const value = state.globalStats?.total?.scripts || 0;
      return value;
    },

    charactersCount: (state) => {
      return state.globalStats?.total?.characters || 0;
    },

    sharesCount: (state) => {
      return state.globalStats?.total?.shares || 0;
    },

    usersCount: (state) => {
      return state.globalStats?.total?.users || 0;
    },

    // Roteiros por status
    scriptsByStatus: (state) => {
      return state.globalStats?.scripts?.byStatus || [];
    },

    // Atividade recente
    recentActivity: (state) => {
      return state.globalStats?.scripts?.recentActivity || 0;
    },

    // Verificar se tem dados
    hasStats: (state) => {
      return !!state.globalStats;
    },

    // Verificar se tem roteiros recentes
    hasRecentScripts: (state) => {
      return state.recentScripts.length > 0;
    },

    // Formatar última atualização
    formattedLastUpdated: (state) => {
      if (!state.lastUpdated) return null;
      return new Date(state.lastUpdated).toLocaleString('pt-BR');
    }
  }
};