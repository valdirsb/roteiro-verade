<template>
  <div class="forgot-password-page">
    <div class="forgot-password-container">
      <h1>Recuperar Senha</h1>
      <p>Página de recuperação de senha em desenvolvimento.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ForgotPasswordPage',
  data() {
    return {
      // Dados do formulário
    }
  },
  methods: {
    // Métodos do componente
  }
}
</script>

<style scoped>
.forgot-password-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.forgot-password-container {
  max-width: 400px;
  width: 100%;
  text-align: center;
}

h1 {
  margin-bottom: 20px;
  color: var(--text-primary);
}

p {
  color: var(--text-secondary);
}
</style> 