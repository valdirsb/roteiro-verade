<template>
  <div class="profile-page">
    <div class="profile-container">
      <h1>Perfil</h1>
      <p>Página de perfil em desenvolvimento.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfilePage',
  data() {
    return {
      // Dados do perfil
    }
  },
  methods: {
    // Métodos do componente
  }
}
</script>

<style scoped>
.profile-page {
  padding: 20px;
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 20px;
  color: var(--text-primary);
}

p {
  color: var(--text-secondary);
}
</style> 