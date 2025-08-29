<template>
  <header class="app-header">
    <div class="app-header__left">
      <button
        class="app-header__menu-toggle"
        @click="toggleSidebar"
        aria-label="Toggle menu"
      >
        <i class="fas fa-bars"></i>
      </button>

      <!-- <div class="app-header__brand">
        <img src="/favicon.ico" alt="Logo" class="app-header__logo" />
        <h1 class="app-header__title">Roteiro Verade</h1>
      </div> -->
    </div>

    <div class="app-header__center">
      <div class="app-header__search">
        <BaseInput
          v-model="searchQuery"
          type="search"
          placeholder="Buscar roteiros, personagens..."
                      icon="fa-magnifying-glass"
          clearable
          @input="handleSearch"
          @clear="clearSearch"
        />
      </div>
    </div>

    <div class="app-header__right">
      <!-- Notificações -->
      <button
        class="app-header__action"
        @click="toggleNotifications"
        :class="{ 'app-header__action--active': showNotifications }"
        aria-label="Notificações"
      >
        <i class="fas fa-bell"></i>
        <span v-if="notificationCount > 0" class="app-header__badge">
          {{ notificationCount > 99 ? '99+' : notificationCount }}
        </span>
      </button>

      <!-- Tema -->
      <button
        class="app-header__theme-toggle"
        @click="toggleTheme"
        :title="theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'"
        aria-label="Alternar tema"
      >
        <i :class="themeIcon"></i>
        <span class="app-header__theme-text">{{ theme === 'dark' ? 'Claro' : 'Escuro' }}</span>
      </button>

      <!-- Menu do usuário -->
      <div class="app-header__user-menu">
        <button
          class="app-header__user-toggle"
          @click="toggleUserMenu"
          :class="{ 'app-header__user-toggle--active': showUserMenu }"
          aria-label="Menu do usuário"
        >
          <img
            v-if="userAvatar"
            :src="userAvatar"
            :alt="userName"
            class="app-header__avatar"
          />
          <div v-else class="app-header__avatar-placeholder">
            <i class="fas fa-user"></i>
          </div>
          <span class="app-header__user-name">{{ userName }}</span>
          <i class="fas fa-chevron-down"></i>
        </button>

        <Transition name="dropdown">
          <div v-if="showUserMenu" class="app-header__dropdown">
            <div class="app-header__dropdown-header">
              <div class="app-header__dropdown-user">
                <img
                  v-if="userAvatar"
                  :src="userAvatar"
                  :alt="userName"
                  class="app-header__dropdown-avatar"
                />
                <div v-else class="app-header__dropdown-avatar-placeholder">
                  <i class="fas fa-user"></i>
                </div>
                <div class="app-header__dropdown-info">
                  <div class="app-header__dropdown-name">{{ userName }}</div>
                  <div class="app-header__dropdown-email">{{ userEmail }}</div>
                  <div class="app-header__dropdown-role">{{ userRole }}</div>
                </div>
              </div>
            </div>

            <div class="app-header__dropdown-menu">
              <router-link
                to="/profile"
                class="app-header__dropdown-item"
                @click="closeUserMenu"
              >
                <i class="fas fa-user"></i>
                <span>Perfil</span>
              </router-link>

              <router-link
                to="/settings"
                class="app-header__dropdown-item"
                @click="closeUserMenu"
              >
                <i class="fas fa-gear"></i>
                <span>Configurações</span>
              </router-link>

              <div class="app-header__dropdown-divider"></div>

              <button
                class="app-header__dropdown-item app-header__dropdown-item--danger"
                @click="handleLogout"
              >
                <i class="fas fa-right-from-bracket"></i>
                <span>Sair</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import BaseInput from '@/components/ui/BaseInput.vue'

export default {
  name: 'AppHeader',

  components: {
    BaseInput
  },

  data() {
    return {
      searchQuery: '',
      showNotifications: false,
      showUserMenu: false
    }
  },

  computed: {
    ...mapGetters({
      sidebarOpen: 'ui/sidebarOpen',
      theme: 'ui/theme',
      notificationCount: 'ui/notificationCount',
      user: 'auth/user',
      userName: 'auth/userName',
      userEmail: 'auth/userEmail'
    }),

    themeIcon() {
      return this.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'
    },

    userAvatar() {
      return this.user?.avatar || null
    },

    userRole() {
      if (!this.user?.roles) return ''
      const roles = this.user.roles
      if (roles.includes('admin')) return 'Administrador'
      if (roles.includes('editor')) return 'Editor'
      if (roles.includes('viewer')) return 'Visualizador'
      return 'Usuário'
    }
  },

  methods: {
    ...mapActions({
      toggleSidebar: 'ui/toggleSidebar',
      toggleTheme: 'ui/toggleTheme',
      logout: 'auth/logout'
    }),

    handleSearch(query) {
      // Implementar busca global
      console.log('Buscar:', query)
    },

    clearSearch() {
      this.searchQuery = ''
    },

    toggleNotifications() {
      this.showNotifications = !this.showNotifications
      this.showUserMenu = false
    },

    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu
      this.showNotifications = false
    },

    closeUserMenu() {
      this.showUserMenu = false
    },

    async handleLogout() {
      try {
        await this.logout()
        this.$router.push('/login')
      } catch (error) {
        console.error('Erro ao fazer logout:', error)
      }
    },

    handleClickOutside(event) {
      const userMenu = this.$el.querySelector('.app-header__user-menu')
      if (userMenu && !userMenu.contains(event.target)) {
        this.closeUserMenu()
      }
    }
  },

  mounted() {
    // Fechar menus ao clicar fora
    document.addEventListener('click', this.handleClickOutside)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  }
}
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: var(--header-height, 60px);
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
}

.app-header__left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.app-header__menu-toggle {
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-size: 1.1rem;
}

.app-header__menu-toggle:hover {
  background: var(--bg-tertiary);
}

.app-header__brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-header__logo {
  width: 32px;
  height: 32px;
  border-radius: 6px;
}

.app-header__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.app-header__center {
  flex: 1;
  max-width: 500px;
  margin: 0 24px;
}

.app-header__search {
  width: 100%;
}

.app-header__right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-header__action {
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-size: 1.1rem;
  position: relative;
}

.app-header__action:hover {
  background: var(--bg-tertiary);
}

.app-header__action--active {
  background: var(--primary-color);
  color: white;
}

.app-header__badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: var(--error-color);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.app-header__user-menu {
  position: relative;
}

.app-header__user-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.app-header__user-toggle:hover {
  background: var(--bg-tertiary);
}

.app-header__user-toggle--active {
  background: var(--bg-tertiary);
}

.app-header__avatar,
.app-header__avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
}

.app-header__avatar-placeholder {
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.app-header__user-name {
  font-weight: 500;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-header__dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  min-width: 280px;
  z-index: 1000;
}

.app-header__dropdown-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.app-header__dropdown-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-header__dropdown-avatar,
.app-header__dropdown-avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
}

.app-header__dropdown-avatar-placeholder {
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 1.2rem;
}

.app-header__dropdown-info {
  flex: 1;
  min-width: 0;
}

.app-header__dropdown-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.app-header__dropdown-email {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 2px;
}

.app-header__dropdown-role {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.app-header__dropdown-menu {
  padding: 8px;
}

.app-header__dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px;
  border: none;
  background: none;
  color: var(--text-primary);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  text-decoration: none;
  font-size: 0.875rem;
}

.app-header__dropdown-item:hover {
  background: var(--bg-tertiary);
}

.app-header__dropdown-item--danger {
  color: var(--error-color);
}

.app-header__dropdown-item--danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

.app-header__dropdown-divider {
  height: 1px;
  background: var(--border-color);
  margin: 8px 0;
}

/* Animações */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Responsividade */
@media (max-width: 768px) {
  .app-header {
    padding: 0 16px;
  }

  .app-header__center {
    display: none;
  }

  .app-header__user-name {
    display: none;
  }

  .app-header__title {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .app-header__action {
    padding: 6px;
    font-size: 1rem;
  }

  .app-header__user-toggle {
    padding: 6px 8px;
  }
}

.app-header__theme-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  cursor: pointer;
  padding: 8px 12px;
  border-radius: var(--border-radius);
  transition: all var(--transition-normal);
  font-size: 0.875rem;
  font-weight: 500;
}

.app-header__theme-toggle:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.app-header__theme-toggle:active {
  transform: translateY(0);
}

.app-header__theme-toggle i {
  font-size: 1rem;
  color: var(--primary-color);
}

.app-header__theme-text {
  font-weight: 500;
}

/* Responsividade para o botão de tema */
@media (max-width: 768px) {
  .app-header__theme-toggle {
    padding: 6px 8px;
    font-size: 0.75rem;
  }

  .app-header__theme-text {
    display: none;
  }

  .app-header__theme-toggle i {
    font-size: 1.1rem;
  }
}
</style>
