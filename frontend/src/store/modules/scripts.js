import scriptService from '@/services/scriptService';

export default {
  namespaced: true,
  
  state: {
    scripts: [],
    currentScript: null,
    scriptMessages: [],
    scriptShares: [],
    sharedScripts: [],
    mySharedScripts: [],
    isLoading: false,
    error: null,
    filters: {
      search: '',
      status: '',
      limit: 20,
      offset: 0,
      sort_by: 'updated_at',
      sort_order: 'desc'
    },
    pagination: {
      total: 0,
      page: 1,
      limit: 20
    }
  },

  mutations: {
    SET_SCRIPTS(state, scripts) {
      state.scripts = scripts;
    },
    
    SET_CURRENT_SCRIPT(state, script) {
      state.currentScript = script;
    },
    
    SET_SCRIPT_MESSAGES(state, messages) {
      state.scriptMessages = messages;
    },
    
    SET_SCRIPT_SHARES(state, shares) {
      state.scriptShares = shares;
    },
    
    SET_SHARED_SCRIPTS(state, scripts) {
      state.sharedScripts = scripts;
    },
    
    SET_MY_SHARED_SCRIPTS(state, scripts) {
      state.mySharedScripts = scripts;
    },
    
    ADD_SCRIPT(state, script) {
      state.scripts.unshift(script);
    },
    
    UPDATE_SCRIPT(state, updatedScript) {
      const index = state.scripts.findIndex(script => script.id === updatedScript.id);
      if (index !== -1) {
        state.scripts.splice(index, 1, updatedScript);
      }
      
      if (state.currentScript && state.currentScript.id === updatedScript.id) {
        state.currentScript = updatedScript;
      }
    },
    
    REMOVE_SCRIPT(state, scriptId) {
      state.scripts = state.scripts.filter(script => script.id !== scriptId);
      
      if (state.currentScript && state.currentScript.id === scriptId) {
        state.currentScript = null;
      }
    },
    
    ADD_MESSAGE(state, message) {
      state.scriptMessages.push(message);
    },
    
    UPDATE_MESSAGE(state, updatedMessage) {
      const index = state.scriptMessages.findIndex(msg => msg.id === updatedMessage.id);
      if (index !== -1) {
        state.scriptMessages.splice(index, 1, updatedMessage);
      }
    },
    
    REMOVE_MESSAGE(state, messageId) {
      state.scriptMessages = state.scriptMessages.filter(msg => msg.id !== messageId);
    },
    
    REORDER_MESSAGES(state, messageIds) {
      const reorderedMessages = [];
      messageIds.forEach(id => {
        const message = state.scriptMessages.find(msg => msg.id === id);
        if (message) {
          reorderedMessages.push(message);
        }
      });
      state.scriptMessages = reorderedMessages;
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
    
    SET_FILTERS(state, filters) {
      state.filters = { ...state.filters, ...filters };
    },
    
    SET_PAGINATION(state, pagination) {
      state.pagination = { ...state.pagination, ...pagination };
    },
    
    CLEAR_SCRIPTS(state) {
      state.scripts = [];
      state.currentScript = null;
      state.scriptMessages = [];
      state.scriptShares = [];
      state.sharedScripts = [];
      state.mySharedScripts = [];
      state.error = null;
      state.filters = {
        search: '',
        status: '',
        limit: 20,
        offset: 0,
        sort_by: 'updated_at',
        sort_order: 'desc'
      };
      state.pagination = {
        total: 0,
        page: 1,
        limit: 20
      };
    }
  },

  actions: {
    // Carregar todos os roteiros
    async loadScripts({ commit }, filters = {}) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');
      
      try {
        const response = await scriptService.getScripts(filters);
        
        if (response.success) {
          commit('SET_SCRIPTS', response.data.scripts || response.data);
          
          if (response.data.pagination) {
            commit('SET_PAGINATION', response.data.pagination);
          }
          
          return { success: true };
        } else {
          commit('SET_ERROR', response.error);
          return { success: false, error: response.error };
        }
      } catch {
        const errorMessage = 'Erro ao carregar roteiros.';
        commit('SET_ERROR', { type: 'unknown', message: errorMessage });
        return { success: false, error: { type: 'unknown', message: errorMessage } };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Carregar roteiro por ID
    async loadScript({ commit }, id) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');
      
      try {
        const response = await scriptService.getScript(id);
        
        if (response.success) {
          commit('SET_CURRENT_SCRIPT', response.data);
          return { success: true, script: response.data };
        } else {
          commit('SET_ERROR', response.error);
          return { success: false, error: response.error };
        }
      } catch {
        const errorMessage = 'Erro ao carregar roteiro.';
        commit('SET_ERROR', { type: 'unknown', message: errorMessage });
        return { success: false, error: { type: 'unknown', message: errorMessage } };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Criar novo roteiro
    async createScript({ commit, dispatch }, scriptData) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');
      
      try {
        const response = await scriptService.createScript(scriptData);
        
        if (response.success) {
          commit('ADD_SCRIPT', response.data);
          dispatch('setSuccess', 'Roteiro criado com sucesso!', { root: true });
          return { success: true, script: response.data };
        } else {
          commit('SET_ERROR', response.error);
          return { success: false, error: response.error };
        }
      } catch {
        const errorMessage = 'Erro ao criar roteiro.';
        commit('SET_ERROR', { type: 'unknown', message: errorMessage });
        return { success: false, error: { type: 'unknown', message: errorMessage } };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Atualizar roteiro
    async updateScript({ commit, dispatch }, { id, scriptData }) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');
      
      try {
        const response = await scriptService.updateScript(id, scriptData);
        
        if (response.success) {
          commit('UPDATE_SCRIPT', response.data);
          dispatch('setSuccess', 'Roteiro atualizado com sucesso!', { root: true });
          return { success: true, script: response.data };
        } else {
          commit('SET_ERROR', response.error);
          return { success: false, error: response.error };
        }
      } catch {
        const errorMessage = 'Erro ao atualizar roteiro.';
        commit('SET_ERROR', { type: 'unknown', message: errorMessage });
        return { success: false, error: { type: 'unknown', message: errorMessage } };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Excluir roteiro
    async deleteScript({ commit, dispatch }, id) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');
      
      try {
        const response = await scriptService.deleteScript(id);
        
        if (response.success) {
          commit('REMOVE_SCRIPT', id);
          dispatch('setSuccess', 'Roteiro excluído com sucesso!', { root: true });
          return { success: true };
        } else {
          commit('SET_ERROR', response.error);
          return { success: false, error: response.error };
        }
      } catch {
        const errorMessage = 'Erro ao excluir roteiro.';
        commit('SET_ERROR', { type: 'unknown', message: errorMessage });
        return { success: false, error: { type: 'unknown', message: errorMessage } };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Duplicar roteiro
    async duplicateScript({ commit, dispatch }, id) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');
      
      try {
        const response = await scriptService.duplicateScript(id);
        
        if (response.success) {
          commit('ADD_SCRIPT', response.data);
          dispatch('setSuccess', 'Roteiro duplicado com sucesso!', { root: true });
          return { success: true, script: response.data };
        } else {
          commit('SET_ERROR', response.error);
          return { success: false, error: response.error };
        }
      } catch {
        const errorMessage = 'Erro ao duplicar roteiro.';
        commit('SET_ERROR', { type: 'unknown', message: errorMessage });
        return { success: false, error: { type: 'unknown', message: errorMessage } };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // MENSAGENS

    // Carregar mensagens do roteiro
    async loadScriptMessages({ commit }, scriptId) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');
      
      try {
        const response = await scriptService.getScriptMessages(scriptId);
        
        if (response.success) {
          commit('SET_SCRIPT_MESSAGES', response.data);
          return { success: true };
        } else {
          commit('SET_ERROR', response.error);
          return { success: false, error: response.error };
        }
      } catch {
        const errorMessage = 'Erro ao carregar mensagens.';
        commit('SET_ERROR', { type: 'unknown', message: errorMessage });
        return { success: false, error: { type: 'unknown', message: errorMessage } };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Adicionar mensagem
    async addMessage({ commit, dispatch }, { scriptId, messageData }) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');
      
      try {
        const response = await scriptService.addMessage(scriptId, messageData);
        
        if (response.success) {
          commit('ADD_MESSAGE', response.data);
          dispatch('setSuccess', 'Mensagem adicionada com sucesso!', { root: true });
          return { success: true, message: response.data };
        } else {
          commit('SET_ERROR', response.error);
          return { success: false, error: response.error };
        }
      } catch {
        const errorMessage = 'Erro ao adicionar mensagem.';
        commit('SET_ERROR', { type: 'unknown', message: errorMessage });
        return { success: false, error: { type: 'unknown', message: errorMessage } };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Atualizar mensagem
    async updateMessage({ commit, dispatch }, { scriptId, messageId, messageData }) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');
      
      try {
        const response = await scriptService.updateMessage(scriptId, messageId, messageData);
        
        if (response.success) {
          commit('UPDATE_MESSAGE', response.data);
          dispatch('setSuccess', 'Mensagem atualizada com sucesso!', { root: true });
          return { success: true, message: response.data };
        } else {
          commit('SET_ERROR', response.error);
          return { success: false, error: response.error };
        }
      } catch {
        const errorMessage = 'Erro ao atualizar mensagem.';
        commit('SET_ERROR', { type: 'unknown', message: errorMessage });
        return { success: false, error: { type: 'unknown', message: errorMessage } };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Excluir mensagem
    async deleteMessage({ commit, dispatch }, { scriptId, messageId }) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');
      
      try {
        const response = await scriptService.deleteMessage(scriptId, messageId);
        
        if (response.success) {
          commit('REMOVE_MESSAGE', messageId);
          dispatch('setSuccess', 'Mensagem excluída com sucesso!', { root: true });
          return { success: true };
        } else {
          commit('SET_ERROR', response.error);
          return { success: false, error: response.error };
        }
      } catch {
        const errorMessage = 'Erro ao excluir mensagem.';
        commit('SET_ERROR', { type: 'unknown', message: errorMessage });
        return { success: false, error: { type: 'unknown', message: errorMessage } };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Reordenar mensagens
    async reorderMessages({ commit, dispatch }, { scriptId, messageIds }) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');
      
      try {
        const response = await scriptService.reorderMessages(scriptId, messageIds);
        
        if (response.success) {
          commit('REORDER_MESSAGES', messageIds);
          dispatch('setSuccess', 'Mensagens reordenadas com sucesso!', { root: true });
          return { success: true };
        } else {
          commit('SET_ERROR', response.error);
          return { success: false, error: response.error };
        }
      } catch {
        const errorMessage = 'Erro ao reordenar mensagens.';
        commit('SET_ERROR', { type: 'unknown', message: errorMessage });
        return { success: false, error: { type: 'unknown', message: errorMessage } };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // COMPARTILHAMENTO

    // Carregar compartilhamentos
    async loadScriptShares({ commit }, scriptId) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');
      
      try {
        const response = await scriptService.getScriptShares(scriptId);
        
        if (response.success) {
          commit('SET_SCRIPT_SHARES', response.data);
          return { success: true };
        } else {
          commit('SET_ERROR', response.error);
          return { success: false, error: response.error };
        }
      } catch {
        const errorMessage = 'Erro ao carregar compartilhamentos.';
        commit('SET_ERROR', { type: 'unknown', message: errorMessage });
        return { success: false, error: { type: 'unknown', message: errorMessage } };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Compartilhar roteiro
    async shareScript({ commit, dispatch }, { scriptId, shareData }) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');
      
      try {
        const response = await scriptService.shareScript(scriptId, shareData);
        
        if (response.success) {
          dispatch('setSuccess', 'Roteiro compartilhado com sucesso!', { root: true });
          return { success: true, share: response.data };
        } else {
          commit('SET_ERROR', response.error);
          return { success: false, error: response.error };
        }
      } catch {
        const errorMessage = 'Erro ao compartilhar roteiro.';
        commit('SET_ERROR', { type: 'unknown', message: errorMessage });
        return { success: false, error: { type: 'unknown', message: errorMessage } };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Carregar roteiros compartilhados
    async loadSharedScripts({ commit }) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');
      
      try {
        const response = await scriptService.getSharedScripts();
        
        if (response.success) {
          commit('SET_SHARED_SCRIPTS', response.data);
          return { success: true };
        } else {
          commit('SET_ERROR', response.error);
          return { success: false, error: response.error };
        }
      } catch {
        const errorMessage = 'Erro ao carregar roteiros compartilhados.';
        commit('SET_ERROR', { type: 'unknown', message: errorMessage });
        return { success: false, error: { type: 'unknown', message: errorMessage } };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Carregar roteiros que compartilhei
    async loadMySharedScripts({ commit }) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');
      
      try {
        const response = await scriptService.getMySharedScripts();
        
        if (response.success) {
          commit('SET_MY_SHARED_SCRIPTS', response.data);
          return { success: true };
        } else {
          commit('SET_ERROR', response.error);
          return { success: false, error: response.error };
        }
      } catch {
        const errorMessage = 'Erro ao carregar meus roteiros compartilhados.';
        commit('SET_ERROR', { type: 'unknown', message: errorMessage });
        return { success: false, error: { type: 'unknown', message: errorMessage } };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Buscar roteiros
    async searchScripts({ commit, dispatch }, query) {
      commit('SET_FILTERS', { search: query, offset: 0 });
      return await dispatch('loadScripts', { search: query, offset: 0 });
    },

    // Aplicar filtros
    async applyFilters({ commit, dispatch }, filters) {
      commit('SET_FILTERS', { ...filters, offset: 0 });
      return await dispatch('loadScripts', { ...filters, offset: 0 });
    },

    // Carregar próxima página
    async loadNextPage({ commit, state, dispatch }) {
      const nextOffset = state.filters.offset + state.filters.limit;
      commit('SET_FILTERS', { offset: nextOffset });
      return await dispatch('loadScripts', { offset: nextOffset });
    },

    // Carregar roteiros recentes para o Dashboard
    async fetchRecentScripts({ commit }) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');
      
      try {
        const response = await scriptService.getRecentScripts(5);
        
        if (response.success) {
          // Atualizar apenas os roteiros recentes no estado
          const recentScripts = response.data.scripts || response.data;
          commit('SET_SCRIPTS', recentScripts);
          
          if (response.data.pagination) {
            commit('SET_PAGINATION', response.data.pagination);
          }
          
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

    // Limpar roteiros
    clearScripts({ commit }) {
      commit('CLEAR_SCRIPTS');
    },

    // Limpar erro
    clearError({ commit }) {
      commit('CLEAR_ERROR');
    }
  },

  getters: {
    scripts: state => state.scripts,
    currentScript: state => state.currentScript,
    scriptMessages: state => state.scriptMessages,
    scriptShares: state => state.scriptShares,
    sharedScripts: state => state.sharedScripts,
    mySharedScripts: state => state.mySharedScripts,
    isLoading: state => state.isLoading,
    error: state => state.error,
    hasError: state => !!state.error,
    filters: state => state.filters,
    pagination: state => state.pagination,
    
    // Roteiros filtrados
    filteredScripts: (state) => {
      let scripts = state.scripts;
      
      if (state.filters.search) {
        const search = state.filters.search.toLowerCase();
        scripts = scripts.filter(script => 
          script.title.toLowerCase().includes(search) ||
          (script.description && script.description.toLowerCase().includes(search))
        );
      }
      
      if (state.filters.status) {
        scripts = scripts.filter(script => script.status === state.filters.status);
      }
      
      return scripts;
    },
    
    // Roteiro por ID
    scriptById: (state) => (id) => {
      return state.scripts.find(script => script.id === id);
    },
    
    // Total de roteiros
    totalScripts: (state) => {
      return state.scripts.length;
    },
    
    // Alias para totalScripts (usado no Dashboard)
    totalCount: (state) => {
      return state.scripts.length;
    },
    
    // Roteiros recentes (últimos 5)
    recentScripts: (state) => {
      return [...state.scripts]
        .sort((a, b) => new Date(b.updatedAt || b.updated_at) - new Date(a.updatedAt || a.updated_at))
        .slice(0, 5);
    },
    
    // Total de compartilhamentos (global)
    totalShares: (state) => {
      return state.scriptShares.length + state.sharedScripts.length + state.mySharedScripts.length;
    },
    
    // Verificar se tem roteiros
    hasScripts: (state) => {
      return state.scripts.length > 0;
    },
    
    // Verificar se tem mensagens
    hasMessages: (state) => {
      return state.scriptMessages.length > 0;
    },
    
    // Total de mensagens
    totalMessages: (state) => {
      return state.scriptMessages.length;
    },
    
    // Mensagens ordenadas por posição
    orderedMessages: (state) => {
      return [...state.scriptMessages].sort((a, b) => a.position - b.position);
    }
  }
}; 