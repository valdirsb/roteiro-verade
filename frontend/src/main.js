import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import './assets/main.css'

// Função assíncrona para inicializar a aplicação
async function initializeApp() {
  // Criar aplicação Vue
  const app = createApp(App)

  // Usar store e router
  app.use(store)
  app.use(router)

  // Inicializar autenticação
  await store.dispatch('auth/initAuth')
  await store.dispatch('auth/checkAuth')

  // Montar aplicação
  app.mount('#app')

  // Inicializar UI quando a aplicação carregar
  store.dispatch('ui/initializeUI')
}

// Inicializar a aplicação
initializeApp().catch(error => {
  console.error('Erro ao inicializar a aplicação:', error)
})

// Listener para logout automático
window.addEventListener('auth:logout', () => {
  // Não precisamos chamar logout novamente, apenas limpar o estado
  // O logout já foi feito pelo authService
  store.commit('auth/CLEAR_AUTH')
  router.push('/login')
})

// Listener para mudanças de tema
window.addEventListener('storage', (event) => {
  if (event.key === 'theme') {
    store.dispatch('ui/setTheme', event.newValue || 'light')
  }
})
