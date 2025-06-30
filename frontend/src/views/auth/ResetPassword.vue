<template>
  <div class="reset-password-page">
    <div class="reset-password-container">
      <h1>Redefinir Senha</h1>
      <p>Página de redefinição de senha em desenvolvimento.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResetPasswordPage',
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
.reset-password-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.reset-password-container {
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