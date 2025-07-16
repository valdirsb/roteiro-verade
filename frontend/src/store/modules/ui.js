export default {
  namespaced: true,

  state: {
    // Sidebar
    sidebarOpen: false,

    // Modais
    modals: {
      login: false,
      register: false,
      createScript: false,
      createCharacter: false,
      shareScript: false,
      confirmDelete: false,
      settings: false,
      viewScript: false
    },
    // Dados dinâmicos para modais
    modalData: {},

    // Notificações
    notifications: [],

    // Tema
    theme: 'light', // 'light' ou 'dark'

    // Layout
    layout: {
      sidebarWidth: 280,
      headerHeight: 60,
      footerHeight: 40
    },

    // Estados de carregamento específicos
    loadingStates: {
      scripts: false,
      characters: false,
      messages: false,
      shares: false
    },

    // Filtros ativos
    activeFilters: {
      scripts: {},
      characters: {}
    },

    // Ordenação
    sortOptions: {
      scripts: {
        field: 'updated_at',
        order: 'desc'
      },
      characters: {
        field: 'name',
        order: 'asc'
      }
    },

    // Paginação
    pagination: {
      scripts: {
        page: 1,
        limit: 20,
        total: 0
      },
      characters: {
        page: 1,
        limit: 50,
        total: 0
      }
    }
  },

  mutations: {
    // Sidebar
    TOGGLE_SIDEBAR(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },

    SET_SIDEBAR_OPEN(state, open) {
      state.sidebarOpen = open;
    },

    // Modais
    OPEN_MODAL(state, modalName) {
      if (Object.prototype.hasOwnProperty.call(state.modals, modalName)) {
        state.modals[modalName] = true;
      }
    },

    CLOSE_MODAL(state, modalName) {
      if (Object.prototype.hasOwnProperty.call(state.modals, modalName)) {
        state.modals[modalName] = false;
      }
    },

    CLOSE_ALL_MODALS(state) {
      Object.keys(state.modals).forEach(key => {
        state.modals[key] = false;
      });
      state.modalData = {};
    },

    SET_MODAL_DATA(state, data) {
      state.modalData = data || {};
    },

    CLEAR_MODAL_DATA(state) {
      state.modalData = {};
    },

    // Notificações
    ADD_NOTIFICATION(state, notification) {
      const id = Date.now() + Math.random();
      state.notifications.push({
        id,
        ...notification,
        timestamp: new Date()
      });
    },

    REMOVE_NOTIFICATION(state, id) {
      state.notifications = state.notifications.filter(notif => notif.id !== id);
    },

    CLEAR_NOTIFICATIONS(state) {
      state.notifications = [];
    },

    // Tema
    SET_THEME(state, theme) {
      state.theme = theme;
      localStorage.setItem('theme', theme);
    },

    // Layout
    SET_LAYOUT(state, layout) {
      state.layout = { ...state.layout, ...layout };
    },

    // Estados de carregamento
    SET_LOADING_STATE(state, { key, loading }) {
      if (Object.prototype.hasOwnProperty.call(state.loadingStates, key)) {
        state.loadingStates[key] = loading;
      }
    },

    // Filtros
    SET_ACTIVE_FILTERS(state, { type, filters }) {
      if (Object.prototype.hasOwnProperty.call(state.activeFilters, type)) {
        state.activeFilters[type] = { ...state.activeFilters[type], ...filters };
      }
    },

    CLEAR_FILTERS(state, type) {
      if (Object.prototype.hasOwnProperty.call(state.activeFilters, type)) {
        state.activeFilters[type] = {};
      }
    },

    // Ordenação
    SET_SORT_OPTIONS(state, { type, field, order }) {
      if (Object.prototype.hasOwnProperty.call(state.sortOptions, type)) {
        state.sortOptions[type] = { field, order };
      }
    },

    // Paginação
    SET_PAGINATION(state, { type, pagination }) {
      if (Object.prototype.hasOwnProperty.call(state.pagination, type)) {
        state.pagination[type] = { ...state.pagination[type], ...pagination };
      }
    },

    // Reset UI
    RESET_UI(state) {
      state.sidebarOpen = false;
      state.modals = {
        login: false,
        register: false,
        createScript: false,
        createCharacter: false,
        shareScript: false,
        confirmDelete: false,
        settings: false,
        viewScript: false
      };
      state.notifications = [];
      state.loadingStates = {
        scripts: false,
        characters: false,
        messages: false,
        shares: false
      };
      state.activeFilters = {
        scripts: {},
        characters: {}
      };
      state.sortOptions = {
        scripts: {
          field: 'updated_at',
          order: 'desc'
        },
        characters: {
          field: 'name',
          order: 'asc'
        }
      };
      state.pagination = {
        scripts: {
          page: 1,
          limit: 20,
          total: 0
        },
        characters: {
          page: 1,
          limit: 50,
          total: 0
        }
      };
    }
  },

  actions: {
    // Sidebar
    toggleSidebar({ commit }) {
      commit('TOGGLE_SIDEBAR');
    },

    openSidebar({ commit }) {
      commit('SET_SIDEBAR_OPEN', true);
    },

    closeSidebar({ commit }) {
      commit('SET_SIDEBAR_OPEN', false);
    },

    // Modais
    openModal({ commit }, modalName) {
      commit('OPEN_MODAL', modalName);
    },

    closeModal({ commit }, modalName) {
      commit('CLOSE_MODAL', modalName);
    },

    closeAllModals({ commit }) {
      commit('CLOSE_ALL_MODALS');
    },

    // Notificações
    addNotification({ commit }, notification) {
      commit('ADD_NOTIFICATION', notification);

      // Auto-remover notificação após 5 segundos
      if (notification.autoRemove !== false) {
        setTimeout(() => {
          commit('REMOVE_NOTIFICATION', notification.id);
        }, 5000);
      }
    },

    removeNotification({ commit }, id) {
      commit('REMOVE_NOTIFICATION', id);
    },

    clearNotifications({ commit }) {
      commit('CLEAR_NOTIFICATIONS');
    },

    // Notificações de sucesso
    showSuccess({ dispatch }, message) {
      dispatch('addNotification', {
        type: 'success',
        message,
        icon: 'check-circle'
      });
    },

    // Notificações de erro
    showError({ dispatch }, message) {
      dispatch('addNotification', {
        type: 'error',
        message,
        icon: 'alert-circle'
      });
    },

    // Notificações de aviso
    showWarning({ dispatch }, message) {
      dispatch('addNotification', {
        type: 'warning',
        message,
        icon: 'alert-triangle'
      });
    },

    // Notificações de informação
    showInfo({ dispatch }, message) {
      dispatch('addNotification', {
        type: 'info',
        message,
        icon: 'info'
      });
    },

    // Tema
    setTheme({ commit }, theme) {
      commit('SET_THEME', theme);

      // Aplicar tema ao documento
      document.documentElement.setAttribute('data-theme', theme);
    },

    toggleTheme({ commit, state }) {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      commit('SET_THEME', newTheme);

      // Aplicar tema ao documento
      document.documentElement.setAttribute('data-theme', newTheme);
    },

    // Layout
    setLayout({ commit }, layout) {
      commit('SET_LAYOUT', layout);
    },

    // Estados de carregamento
    setLoadingState({ commit }, { key, loading }) {
      commit('SET_LOADING_STATE', { key, loading });
    },

    // Filtros
    setActiveFilters({ commit }, { type, filters }) {
      commit('SET_ACTIVE_FILTERS', { type, filters });
    },

    clearFilters({ commit }, type) {
      commit('CLEAR_FILTERS', type);
    },

    // Ordenação
    setSortOptions({ commit }, { type, field, order }) {
      commit('SET_SORT_OPTIONS', { type, field, order });
    },

    // Paginação
    setPagination({ commit }, { type, pagination }) {
      commit('SET_PAGINATION', { type, pagination });
    },

    // Inicializar UI
    initializeUI({ dispatch }) {
      // Carregar tema do localStorage
      const savedTheme = localStorage.getItem('theme') || 'light';
      dispatch('setTheme', savedTheme);

      // Aplicar tema ao documento
      document.documentElement.setAttribute('data-theme', savedTheme);
    },

    // Reset UI
    resetUI({ commit }) {
      commit('RESET_UI');
    }
  },

  getters: {
    // Sidebar
    sidebarOpen: state => state.sidebarOpen,

    // Modais
    modals: state => state.modals,
    isModalOpen: (state) => (modalName) => {
      return state.modals[modalName] || false;
    },
    hasOpenModals: (state) => {
      return Object.values(state.modals).some(open => open);
    },
    modalData: state => state.modalData,

    // Notificações
    notifications: state => state.notifications,
    hasNotifications: state => state.notifications.length > 0,
    notificationCount: state => state.notifications.length,

    // Tema
    theme: state => state.theme,
    isDarkTheme: state => state.theme === 'dark',
    isLightTheme: state => state.theme === 'light',

    // Layout
    layout: state => state.layout,

    // Estados de carregamento
    loadingStates: state => state.loadingStates,
    isLoading: (state) => (key) => {
      return state.loadingStates[key] || false;
    },
    hasAnyLoading: (state) => {
      return Object.values(state.loadingStates).some(loading => loading);
    },

    // Filtros
    activeFilters: state => state.activeFilters,
    getActiveFilters: (state) => (type) => {
      return state.activeFilters[type] || {};
    },

    // Ordenação
    sortOptions: state => state.sortOptions,
    getSortOptions: (state) => (type) => {
      return state.sortOptions[type] || { field: 'id', order: 'asc' };
    },

    // Paginação
    pagination: state => state.pagination,
    getPagination: (state) => (type) => {
      return state.pagination[type] || { page: 1, limit: 20, total: 0 };
    }
  }
};
