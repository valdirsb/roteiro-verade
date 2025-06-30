<template>
  <div class="register-page">
    <div class="register-container">
      <h1>Registro</h1>
      <p>Página de registro em desenvolvimento.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Register',
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
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.register-container {
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