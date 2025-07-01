import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import './assets/main.css'

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

// Listener para logout automático
window.addEventListener('auth:logout', () => {
  store.dispatch('logout')
})

// Listener para mudanças de tema
window.addEventListener('storage', (event) => {
  if (event.key === 'theme') {
    store.dispatch('ui/setTheme', event.newValue || 'light')
  }
})
