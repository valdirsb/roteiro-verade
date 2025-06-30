import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'

// Páginas de autenticação
import Login from '@/views/auth/Login.vue'
import Register from '@/views/auth/Register.vue'
import ForgotPassword from '@/views/auth/ForgotPassword.vue'
import ResetPassword from '@/views/auth/ResetPassword.vue'

// Páginas principais
import Dashboard from '@/views/Dashboard.vue'
import Characters from '@/views/Characters.vue'
import CharacterForm from '@/views/CharacterForm.vue'
import Scripts from '@/views/Scripts.vue'
import ScriptEditor from '@/views/ScriptEditor.vue'
import Profile from '@/views/Profile.vue'
import Settings from '@/views/Settings.vue'

// Páginas de erro
import NotFound from '@/views/errors/NotFound.vue'
import Unauthorized from '@/views/errors/Unauthorized.vue'

const routes = [
  // Rotas públicas (autenticação)
  {
    path: '/',
    name: 'Home',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { 
      requiresGuest: true,
      title: 'Login - Roteiro Verade'
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { 
      requiresGuest: true,
      title: 'Registro - Roteiro Verade'
    }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
    meta: { 
      requiresGuest: true,
      title: 'Recuperar Senha - Roteiro Verade'
    }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPassword,
    meta: { 
      requiresGuest: true,
      title: 'Redefinir Senha - Roteiro Verade'
    }
  },

  // Rotas protegidas (requerem autenticação)
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { 
      requiresAuth: true,
      title: 'Dashboard - Roteiro Verade'
    }
  },
  {
    path: '/characters',
    name: 'Characters',
    component: Characters,
    meta: { 
      requiresAuth: true,
      title: 'Personagens - Roteiro Verade'
    }
  },
  {
    path: '/characters/new',
    name: 'CharacterNew',
    component: CharacterForm,
    meta: { 
      requiresAuth: true,
      requiresAdmin: true,
      title: 'Novo Personagem - Roteiro Verade'
    }
  },
  {
    path: '/characters/:id/edit',
    name: 'CharacterEdit',
    component: CharacterForm,
    props: true,
    meta: { 
      requiresAuth: true,
      requiresAdmin: true,
      title: 'Editar Personagem - Roteiro Verade'
    }
  },
  {
    path: '/scripts',
    name: 'Scripts',
    component: Scripts,
    meta: { 
      requiresAuth: true,
      title: 'Roteiros - Roteiro Verade'
    }
  },
  {
    path: '/scripts/new',
    name: 'ScriptNew',
    component: ScriptEditor,
    meta: { 
      requiresAuth: true,
      requiresEditor: true,
      title: 'Novo Roteiro - Roteiro Verade'
    }
  },
  {
    path: '/scripts/:id',
    name: 'ScriptView',
    component: ScriptEditor,
    props: true,
    meta: { 
      requiresAuth: true,
      title: 'Visualizar Roteiro - Roteiro Verade'
    }
  },
  {
    path: '/scripts/:id/edit',
    name: 'ScriptEdit',
    component: ScriptEditor,
    props: true,
    meta: { 
      requiresAuth: true,
      requiresEditor: true,
      title: 'Editar Roteiro - Roteiro Verade'
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { 
      requiresAuth: true,
      title: 'Perfil - Roteiro Verade'
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { 
      requiresAuth: true,
      title: 'Configurações - Roteiro Verade'
    }
  },

  // Rotas de erro
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: Unauthorized,
    meta: { 
      title: 'Acesso Negado - Roteiro Verade'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { 
      title: 'Página não encontrada - Roteiro Verade'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Guarda de navegação
router.beforeEach(async (to, from, next) => {
  // Atualizar título da página
  if (to.meta.title) {
    document.title = to.meta.title
  }

  // Verificar autenticação
  const isAuthenticated = store.getters['auth/isAuthenticated']
  
  // Se a rota requer autenticação e o usuário não está autenticado
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }

  // Se a rota é apenas para convidados e o usuário está autenticado
  if (to.meta.requiresGuest && isAuthenticated) {
    next('/dashboard')
    return
  }

  // Verificar permissões específicas
  if (to.meta.requiresAdmin && !store.getters['auth/isAdmin']) {
    next('/unauthorized')
    return
  }

  if (to.meta.requiresEditor && !store.getters['auth/isEditor']) {
    next('/unauthorized')
    return
  }

  next()
})

// Hook após navegação
router.afterEach(() => {
  // Fechar sidebar em dispositivos móveis
  if (window.innerWidth <= 768) {
    store.dispatch('ui/closeSidebar')
  }

  // Fechar todos os modais
  store.dispatch('ui/closeAllModals')

  // Limpar notificações antigas
  store.dispatch('ui/clearNotifications')
})

export default router 