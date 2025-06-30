<template>
  <div id="app" :data-theme="theme">
    <!-- Sistema de Notificações -->
    <NotificationContainer />
    
    <!-- Sistema de Modais -->
    <ModalContainer />
    
    <!-- Layout Principal -->
    <div class="app-layout">
      <!-- Sidebar -->
      <AppSidebar />
      
      <!-- Conteúdo Principal -->
      <main class="app-main">
        <!-- Header -->
        <AppHeader />
        
        <!-- Conteúdo da Página -->
        <div class="app-content">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import NotificationContainer from '@/components/ui/NotificationContainer.vue'
import ModalContainer from '@/components/ui/ModalContainer.vue'

export default {
  name: 'App',
  
  components: {
    AppHeader,
    AppSidebar,
    NotificationContainer,
    ModalContainer
  },

  computed: {
    ...mapGetters({
      theme: 'ui/theme',
      isAuthenticated: 'auth/isAuthenticated'
    })
  },

  methods: {
    ...mapActions({
      initializeUI: 'ui/initializeUI',
      checkAuth: 'auth/checkAuth'
    })
  },

  async mounted() {
    // Inicializar UI
    this.initializeUI()
    
    // Verificar autenticação ao carregar
    try {
      await this.checkAuth()
    } catch (error) {
      console.log('Usuário não autenticado:', error)
    }
  }
}
</script>

<style>
/* Reset e base */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  line-height: 1.5;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Layout da aplicação */
.app-layout {
  display: flex;
  min-height: 100vh;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.app-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

/* Responsividade */
@media (max-width: 1023px) {
  .app-content {
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .app-content {
    padding: 12px;
  }
}

/* Scrollbar personalizada */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

/* Seleção de texto */
::selection {
  background: var(--primary-color);
  color: white;
}

/* Foco global */
:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* Animações globais */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(-100%);
}

.slide-leave-to {
  transform: translateX(100%);
}

/* Utilitários */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.text-center {
  text-align: center;
}

.text-left {
  text-align: left;
}

.text-right {
  text-align: right;
}

.d-flex {
  display: flex;
}

.d-none {
  display: none;
}

.align-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.flex-column {
  flex-direction: column;
}

.flex-1 {
  flex: 1;
}

.gap-1 { gap: 0.25rem; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }
.gap-5 { gap: 1.25rem; }
.gap-6 { gap: 1.5rem; }

.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-3 { margin-top: 0.75rem; }
.mt-4 { margin-top: 1rem; }
.mt-5 { margin-top: 1.25rem; }
.mt-6 { margin-top: 1.5rem; }

.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 0.75rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-5 { margin-bottom: 1.25rem; }
.mb-6 { margin-bottom: 1.5rem; }

.ml-1 { margin-left: 0.25rem; }
.ml-2 { margin-left: 0.5rem; }
.ml-3 { margin-left: 0.75rem; }
.ml-4 { margin-left: 1rem; }
.ml-5 { margin-left: 1.25rem; }
.ml-6 { margin-left: 1.5rem; }

.mr-1 { margin-right: 0.25rem; }
.mr-2 { margin-right: 0.5rem; }
.mr-3 { margin-right: 0.75rem; }
.mr-4 { margin-right: 1rem; }
.mr-5 { margin-right: 1.25rem; }
.mr-6 { margin-right: 1.5rem; }

.p-1 { padding: 0.25rem; }
.p-2 { padding: 0.5rem; }
.p-3 { padding: 0.75rem; }
.p-4 { padding: 1rem; }
.p-5 { padding: 1.25rem; }
.p-6 { padding: 1.5rem; }

.w-full {
  width: 100%;
}

.h-full {
  height: 100%;
}

.rounded {
  border-radius: 0.375rem;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.rounded-xl {
  border-radius: 0.75rem;
}

.shadow {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.shadow-xl {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Estados de loading */
.loading {
  opacity: 0.6;
  pointer-events: none;
}

.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border: 2px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Estados de erro */
.error {
  color: var(--error-color);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--error-color);
  border-radius: 0.375rem;
  padding: 0.75rem;
}

/* Estados de sucesso */
.success {
  color: var(--success-color);
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid var(--success-color);
  border-radius: 0.375rem;
  padding: 0.75rem;
}

/* Estados de aviso */
.warning {
  color: var(--warning-color);
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid var(--warning-color);
  border-radius: 0.375rem;
  padding: 0.75rem;
}

/* Estados de informação */
.info {
  color: var(--info-color);
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid var(--info-color);
  border-radius: 0.375rem;
  padding: 0.75rem;
}
</style>
