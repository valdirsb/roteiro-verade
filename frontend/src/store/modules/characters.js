import characterService from '@/services/characterService';

export default {
  namespaced: true,

  state: {
    characters: [],
    defaultCharacters: [],
    currentCharacter: null,
    isLoading: false,
    error: null,
    filters: {
      search: '',
      is_default: null,
      limit: 50,
      offset: 0
    },
    pagination: {
      total: 0,
      page: 1,
      limit: 50
    }
  },

  mutations: {
    SET_CHARACTERS(state, characters) {
      state.characters = characters;
    },

    SET_DEFAULT_CHARACTERS(state, characters) {
      state.defaultCharacters = characters;
    },

    SET_CURRENT_CHARACTER(state, character) {
      state.currentCharacter = character;
    },

    ADD_CHARACTER(state, character) {
      state.characters.data.characters.unshift(character);
    },

    UPDATE_CHARACTER(state, updatedCharacter) {
      const index = state.characters.findIndex(char => char.id === updatedCharacter.id);
      if (index !== -1) {
        state.characters.splice(index, 1, updatedCharacter);
      }

      if (state.currentCharacter && state.currentCharacter.id === updatedCharacter.id) {
        state.currentCharacter = updatedCharacter;
      }
    },

    REMOVE_CHARACTER(state, characterId) {
      state.characters = state.characters.filter(char => char.id !== characterId);

      if (state.currentCharacter && state.currentCharacter.id === characterId) {
        state.currentCharacter = null;
      }
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

    CLEAR_CHARACTERS(state) {
      state.characters = [];
      state.currentCharacter = null;
      state.error = null;
      state.filters = {
        search: '',
        is_default: null,
        limit: 50,
        offset: 0
      };
      state.pagination = {
        total: 0,
        page: 1,
        limit: 50
      };
    }
  },

  actions: {
    // Carregar todos os personagens
    async loadCharacters({ commit }, filters = {}) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');

      try {
        const response = await characterService.getCharactersWithFilters(filters);
        console.log('Response da API em loadCharacters:', response);

        if (response.success) {
          commit('SET_CHARACTERS', response.data.characters || response.data);

          if (response.data.pagination) {
            commit('SET_PAGINATION', response.data.pagination);
          }

          return { success: true };
        } else {
          commit('SET_ERROR', response.error);
          return { success: false, error: response.error };
        }
      } catch {
        const errorMessage = 'Erro ao carregar personagens.';
        commit('SET_ERROR', { type: 'unknown', message: errorMessage });
        return { success: false, error: { type: 'unknown', message: errorMessage } };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Carregar personagem por ID
    async loadCharacter({ commit }, id) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');

      try {
        const response = await characterService.getCharacter(id);

        if (response.success) {
          commit('SET_CURRENT_CHARACTER', response.data);
          return { success: true, character: response.data };
        } else {
          commit('SET_ERROR', response.error);
          return { success: false, error: response.error };
        }
      } catch {
        const errorMessage = 'Erro ao carregar personagem.';
        commit('SET_ERROR', { type: 'unknown', message: errorMessage });
        return { success: false, error: { type: 'unknown', message: errorMessage } };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Criar novo personagem
    async createCharacter({ commit, dispatch }, { characterData, file = null }) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');

      try {
        const response = await characterService.createCharacter(characterData, file);

        console.log("DEBUG: ", response)

        if (response.success) {
          commit('ADD_CHARACTER', response.data.data.character);
          dispatch('setSuccess', 'Personagem criado com sucesso!', { root: true });
          return { success: true, character: response.data.data.character };
        } else {
          // commit('SET_ERROR', response.error);
          return { success: false, error: response.error };
        }
      } catch {
        const errorMessage = 'Erro ao criar personagem.';
        commit('SET_ERROR', { type: 'unknown', message: errorMessage });
        return { success: false, error: { type: 'unknown', message: errorMessage } };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Atualizar personagem
    async updateCharacter({ commit, dispatch }, { id, characterData }) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');

      try {
        const response = await characterService.updateCharacter(id, characterData);

        if (response.success) {
          commit('UPDATE_CHARACTER', response.data);
          dispatch('setSuccess', 'Personagem atualizado com sucesso!', { root: true });
          return { success: true, character: response.data };
        } else {
          commit('SET_ERROR', response.error);
          return { success: false, error: response.error };
        }
      } catch {
        const errorMessage = 'Erro ao atualizar personagem.';
        commit('SET_ERROR', { type: 'unknown', message: errorMessage });
        return { success: false, error: { type: 'unknown', message: errorMessage } };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Excluir personagem
    async deleteCharacter({ commit, dispatch }, id) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');

      try {
        const response = await characterService.deleteCharacter(id);

        if (response.success) {
          commit('REMOVE_CHARACTER', id);
          dispatch('setSuccess', 'Personagem excluído com sucesso!', { root: true });
          return { success: true };
        } else {
          commit('SET_ERROR', response.error);
          return { success: false, error: response.error };
        }
      } catch {
        const errorMessage = 'Erro ao excluir personagem.';
        commit('SET_ERROR', { type: 'unknown', message: errorMessage });
        return { success: false, error: { type: 'unknown', message: errorMessage } };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Upload de avatar
    async uploadAvatar({ commit, dispatch }, { id, file }) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');

      try {
        const response = await characterService.uploadAvatar(id, file);

        if (response.success) {
          commit('UPDATE_CHARACTER', response.data);
          dispatch('setSuccess', 'Avatar atualizado com sucesso!', { root: true });
          return { success: true, character: response.data };
        } else {
          commit('SET_ERROR', response.error);
          return { success: false, error: response.error };
        }
      } catch {
        const errorMessage = 'Erro ao fazer upload do avatar.';
        commit('SET_ERROR', { type: 'unknown', message: errorMessage });
        return { success: false, error: { type: 'unknown', message: errorMessage } };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Duplicar personagem
    async duplicateCharacter({ commit, dispatch }, id) {
      commit('SET_LOADING', true);
      commit('CLEAR_ERROR');

      try {
        const response = await characterService.duplicateCharacter(id);

        if (response.success) {
          commit('ADD_CHARACTER', response.data);
          dispatch('setSuccess', 'Personagem duplicado com sucesso!', { root: true });
          return { success: true, character: response.data };
        } else {
          commit('SET_ERROR', response.error);
          return { success: false, error: response.error };
        }
      } catch {
        const errorMessage = 'Erro ao duplicar personagem.';
        commit('SET_ERROR', { type: 'unknown', message: errorMessage });
        return { success: false, error: { type: 'unknown', message: errorMessage } };
      } finally {
        commit('SET_LOADING', false);
      }
    },

    // Carregar personagens padrão
    loadDefaultCharacters({ commit }) {
      const defaultCharacters = characterService.getDefaultCharacters();
      commit('SET_DEFAULT_CHARACTERS', defaultCharacters);
    },

    // Buscar personagens
    async searchCharacters({ commit, dispatch }, query) {
      commit('SET_FILTERS', { search: query, offset: 0 });
      return await dispatch('loadCharacters', { search: query, offset: 0 });
    },

    // Aplicar filtros
    async applyFilters({ commit, dispatch }, filters) {
      commit('SET_FILTERS', { ...filters, offset: 0 });
      return await dispatch('loadCharacters', { ...filters, offset: 0 });
    },

    // Carregar próxima página
    async loadNextPage({ commit, state, dispatch }) {
      const nextOffset = state.filters.offset + state.filters.limit;
      commit('SET_FILTERS', { offset: nextOffset });
      return await dispatch('loadCharacters', { offset: nextOffset });
    },

    // Limpar personagens
    clearCharacters({ commit }) {
      commit('CLEAR_CHARACTERS');
    },

    // Limpar erro
    clearError({ commit }) {
      commit('CLEAR_ERROR');
    }
  },

  getters: {
    characters: state => state.characters,
    defaultCharacters: state => state.defaultCharacters,
    currentCharacter: state => state.currentCharacter,
    isLoading: state => state.isLoading,
    error: state => state.error,
    hasError: state => !!state.error,
    filters: state => state.filters,
    pagination: state => state.pagination,

    // Personagens filtrados
    filteredCharacters: (state) => {
      let characters = state.characters;

      if (state.filters.search) {
        const search = state.filters.search.toLowerCase();
        characters = characters.filter(char =>
          char.name.toLowerCase().includes(search) ||
          (char.description && char.description.toLowerCase().includes(search))
        );
      }

      if (state.filters.is_default !== null) {
        characters = characters.filter(char => char.is_default === state.filters.is_default);
      }

      return characters;
    },

    // Personagens por nome
    charactersByName: (state) => (name) => {
      return state.characters.filter(char =>
        char.name.toLowerCase().includes(name.toLowerCase())
      );
    },

    // Personagem por ID
    characterById: (state) => (id) => {
      return state.characters.find(char => char.id === id);
    },

    // Personagens padrão e customizados
    allCharacters: (state) => {
      return [...state.defaultCharacters, ...state.characters];
    },

    // Total de personagens (incluindo padrão e customizados)
    totalCharacters: (state) => {
      return state.characters.length + state.defaultCharacters.length;
    },

    // Alias para totalCharacters (usado no Dashboard)
    totalCount: (state) => {
      return state.characters.length + state.defaultCharacters.length;
    },

    // Verificar se tem personagens
    hasCharacters: (state) => {
      return state.characters.length > 0;
    },

    // Verificar se tem personagens customizados
    hasCustomCharacters: (state) => {
      return state.characters.length > 0;
    }
  }
};
