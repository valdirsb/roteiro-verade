<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <img src="/favicon.ico" alt="Logo" class="login-logo" />
        <h1 class="login-title">Roteiro Verade</h1>
        <p class="login-subtitle">Faça login para continuar</p>
      </div>
      
      <form class="login-form" @submit.prevent="handleLogin">
        <BaseInput
          v-model="form.email"
          type="email"
          label="E-mail"
          placeholder="seu@email.com"
          icon="fa-envelope"
          required
          :error="errors.email"
        />
        
        <BaseInput
          v-model="form.password"
          type="password"
          label="Senha"
          placeholder="Sua senha"
          icon="fa-lock"
          required
          :error="errors.password"
        />
        
        <div class="login-options">
          <label class="login-remember">
            <input 
              v-model="form.remember" 
              type="checkbox"
            />
            <span>Lembrar de mim</span>
          </label>
          
          <router-link to="/forgot-password" class="login-forgot">
            Esqueceu a senha?
          </router-link>
        </div>
        
        <BaseButton
          type="submit"
          variant="primary"
          size="large"
          :loading="loading"
          full-width
        >
          Entrar
        </BaseButton>
      </form>
      
      <div class="login-footer">
        <p class="login-signup">
          Não tem uma conta?
          <router-link to="/register" class="login-signup-link">
            Criar conta
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

export default {
  name: 'LoginView',
  
  components: {
    BaseInput,
    BaseButton
  },

  data() {
    return {
      form: {
        email: '',
        password: '',
        remember: false
      },
      errors: {},
      loading: false
    }
  },

  methods: {
    ...mapActions({
      login: 'auth/login',
      addNotification: 'ui/addNotification'
    }),

    async handleLogin() {
      this.loading = true
      this.errors = {}
      
      try {
        await this.login({
          email: this.form.email,
          password: this.form.password,
          remember: this.form.remember
        })
        
        this.addNotification({
          type: 'success',
          message: 'Login realizado com sucesso!',
          details: 'Bem-vindo de volta!'
        })
        
        this.$router.push('/dashboard')
      } catch (error) {
        console.error('Erro no login:', error)
        
        if (error.response?.data?.errors) {
          this.errors = error.response.data.errors
        } else {
          this.addNotification({
            type: 'error',
            message: 'Erro ao fazer login',
            details: error.message || 'Verifique suas credenciais e tente novamente.'
          })
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.login-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
  pointer-events: none;
}

.login-container {
  background: var(--bg-primary);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-xl);
  padding: 48px;
  width: 100%;
  max-width: 400px;
  position: relative;
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  animation: slideUp 0.6s ease-out;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-logo {
  width: 80px;
  height: 80px;
  border-radius: var(--border-radius-lg);
  margin-bottom: 20px;
  box-shadow: var(--shadow-lg);
  border: 3px solid var(--primary-color);
  animation: bounce 0.8s ease-out 0.2s both;
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 400;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
}

.login-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
  margin-top: 8px;
}

.login-remember {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  user-select: none;
}

.login-remember input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--primary-color);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
}

.login-forgot {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  transition: all var(--transition-normal);
  padding: 4px 8px;
  border-radius: var(--border-radius-sm);
}

.login-forgot:hover {
  color: var(--primary-hover);
  background: var(--bg-tertiary);
  text-decoration: none;
}

.login-footer {
  text-align: center;
  padding-top: 32px;
  border-top: 1px solid var(--border-color);
}

.login-signup {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.login-signup-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  margin-left: 4px;
  transition: all var(--transition-normal);
  padding: 4px 8px;
  border-radius: var(--border-radius-sm);
}

.login-signup-link:hover {
  color: var(--primary-hover);
  background: var(--bg-tertiary);
  text-decoration: none;
}

/* Responsividade */
@media (max-width: 480px) {
  .login-page {
    padding: 16px;
  }
  
  .login-container {
    padding: 32px 24px;
    border-radius: var(--border-radius-lg);
  }
  
  .login-logo {
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
  }
  
  .login-title {
    font-size: 1.75rem;
  }
  
  .login-subtitle {
    font-size: 1rem;
  }
  
  .login-form {
    gap: 20px;
    margin-bottom: 24px;
  }
  
  .login-options {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .login-footer {
    padding-top: 24px;
  }
}

/* Tema escuro */
[data-theme="dark"] .login-container {
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
}

[data-theme="dark"] .login-page::before {
  opacity: 0.1;
}

/* Animações */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style> 