<template>
  <aside
    class="app-sidebar"
    :class="{ 'app-sidebar--open': sidebarOpen }"
  >
    <div class="app-sidebar__overlay" @click="closeSidebar"></div>

    <div class="app-sidebar__content">
      <div class="app-sidebar__header">
        <div class="app-sidebar__brand">
          <img src="/logo.jpg" alt="Logo" class="app-sidebar__logo" />
          <h2 class="app-sidebar__title">Roteiro Verade</h2>
        </div>
        <button
          class="app-sidebar__close"
          @click="closeSidebar"
          aria-label="Fechar menu"
        >
          <i class="fas fa-xmark"></i>
        </button>
      </div>

      <nav class="app-sidebar__nav">
        <div class="app-sidebar__section">
          <h3 class="app-sidebar__section-title">Principal</h3>

          <router-link
            to="/dashboard"
            class="app-sidebar__item"
            active-class="app-sidebar__item--active"
          >
            <i class="fas fa-gauge"></i>
            <span>Dashboard</span>
          </router-link>

          <router-link
            to="/scripts"
            class="app-sidebar__item"
            active-class="app-sidebar__item--active"
          >
            <i class="fas fa-file-lines"></i>
            <span>Roteiros</span>
            <span v-if="scriptsCount > 0" class="app-sidebar__badge">
              {{ scriptsCount > 99 ? '99+' : scriptsCount }}
            </span>
          </router-link>

          <router-link
            to="/characters"
            class="app-sidebar__item"
            active-class="app-sidebar__item--active"
          >
            <i class="fas fa-user-group"></i>
            <span>Personagens</span>
            <span v-if="charactersCount > 0" class="app-sidebar__badge">
              {{ charactersCount > 99 ? '99+' : charactersCount }}
            </span>
          </router-link>
        </div>

        <div v-if="isAdmin" class="app-sidebar__section">
          <h3 class="app-sidebar__section-title">Administração</h3>

          <router-link
            to="/users"
            class="app-sidebar__item"
            active-class="app-sidebar__item--active"
          >
            <i class="fas fa-user-gear"></i>
            <span>Usuários</span>
          </router-link>

          <router-link
            to="/settings"
            class="app-sidebar__item"
            active-class="app-sidebar__item--active"
          >
            <i class="fas fa-gear"></i>
            <span>Configurações</span>
          </router-link>
        </div>

        <div class="app-sidebar__section">
          <h3 class="app-sidebar__section-title">Ações Rápidas</h3>

          <button
            class="app-sidebar__item app-sidebar__item--action"
            @click="createScript"
          >
            <i class="fas fa-plus"></i>
            <span>Novo Roteiro</span>
          </button>

          <button
            v-if="isAdmin"
            class="app-sidebar__item app-sidebar__item--action"
            @click="createCharacter"
          >
            <i class="fas fa-user-plus"></i>
            <span>Novo Personagem</span>
          </button>
        </div>
      </nav>

      <div class="app-sidebar__footer">
        <div class="app-sidebar__user">
          <img
            v-if="userAvatar"
            :src="userAvatar"
            :alt="userName"
            class="app-sidebar__user-avatar"
          />
          <div v-else class="app-sidebar__user-avatar-placeholder">
            <i class="fas fa-user"></i>
          </div>
          <div class="app-sidebar__user-info">
            <div class="app-sidebar__user-name">{{ userName }}</div>
            <div class="app-sidebar__user-role">{{ userRole }}</div>
          </div>
        </div>

        <button
          class="app-sidebar__logout"
          @click="handleLogout"
          title="Sair"
        >
                      <i class="fas fa-right-from-bracket"></i>
        </button>
      </div>
    </div>
  </aside>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'AppSidebar',

  computed: {
    ...mapGetters({
      sidebarOpen: 'ui/sidebarOpen',
      user: 'auth/user',
      userName: 'auth/userName',
      isAdmin: 'auth/isAdmin',
      scriptsCount: 'scripts/totalCount',
      charactersCount: 'characters/totalCount'
    }),

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
      closeSidebar: 'ui/closeSidebar',
      logout: 'auth/logout',
      openModal: 'ui/openModal'
    }),

    createScript() {
      this.openModal('createScript')
      this.closeSidebar()
    },

    createCharacter() {
      this.openModal('createCharacter')
      this.closeSidebar()
    },

    async handleLogout() {
      try {
        await this.logout()
        this.$router.push('/login')
      } catch (error) {
        console.error('Erro ao fazer logout:', error)
      }
    }
  }
}
</script>

<style scoped>
.app-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  background: var(--bg-primary);
  border-right: 1px solid var(--border-color);
  z-index: 200;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  display: flex;
}

.app-sidebar--open {
  transform: translateX(0);
}

.app-sidebar__overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-secondary);
  z-index: -1;
}

[data-theme="dark"] .app-sidebar__overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-secondary);
  z-index: -1;
}

.app-sidebar__content {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.app-sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.app-sidebar__brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-sidebar__logo {
  width: 64px;
  height: 64px;
  border-radius: 32px;
}

.app-sidebar__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.app-sidebar__close {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-size: 1.1rem;
}

.app-sidebar__close:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.app-sidebar__nav {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.app-sidebar__section {
  margin-bottom: 32px;
}

.app-sidebar__section:last-child {
  margin-bottom: 0;
}

.app-sidebar__section-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 12px 24px;
}

.app-sidebar__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  color: var(--text-primary);
  text-decoration: none;
  transition: all 0.2s ease;
  border: none;
  background: none;
  width: 100%;
  cursor: pointer;
  font-size: 0.875rem;
  position: relative;
}

.app-sidebar__item:hover {
  background: var(--bg-tertiary);
  color: var(--primary-color);
}

.app-sidebar__item--active {
  background: var(--primary-color);
  color: white;
}

.app-sidebar__item--active:hover {
  background: #7c3aed;
  color: white;
}

.app-sidebar__item--action {
  color: var(--text-secondary);
}

.app-sidebar__item--action:hover {
  background: var(--bg-tertiary);
  color: var(--primary-color);
}

.app-sidebar__item i {
  width: 20px;
  text-align: center;
  font-size: 1rem;
}

.app-sidebar__badge {
  margin-left: auto;
  background: var(--primary-color);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.app-sidebar__item--active .app-sidebar__badge {
  background: rgba(255, 255, 255, 0.2);
}

.app-sidebar__footer {
  padding: 20px 24px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.app-sidebar__user {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.app-sidebar__user-avatar,
.app-sidebar__user-avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}

.app-sidebar__user-avatar-placeholder {
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.app-sidebar__user-info {
  flex: 1;
  min-width: 0;
}

.app-sidebar__user-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
  margin-bottom: 2px;
}

.app-sidebar__user-role {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.app-sidebar__logout {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-size: 1rem;
  width: 100%;
}

.app-sidebar__logout:hover {
  background: var(--bg-tertiary);
  color: var(--error-color);
}

/* Desktop - sempre visível */
@media (min-width: 1024px) {
  .app-sidebar {
    position: static;
    transform: none;
    width: 280px;
    flex-shrink: 0;
  }

  .app-sidebar__overlay {
    display: none;
  }

  .app-sidebar__close {
    display: none;
  }
}

/* Tablet - overlay */
@media (max-width: 1023px) {
  .app-sidebar {
    position: fixed;
  }
}

/* Mobile - ajustes */
@media (max-width: 768px) {
  .app-sidebar {
    width: 100%;
  }

  .app-sidebar__header {
    padding: 16px 20px;
  }

  .app-sidebar__nav {
    padding: 16px 0;
  }

  .app-sidebar__item {
    padding: 16px 20px;
    font-size: 1rem;
  }

  .app-sidebar__footer {
    padding: 16px 20px;
  }
}

/* Tema escuro */
[data-theme="dark"] .app-sidebar {
  border-right-color: var(--border-color);
}
</style>
