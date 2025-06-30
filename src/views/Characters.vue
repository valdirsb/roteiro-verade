<template>
  <div class="characters-page">
    <div class="characters-container">
      <h1>Personagens</h1>
      <p>Página de personagens em desenvolvimento.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CharactersPage',
  data() {
    return {
      // Dados dos personagens
    }
  },
  methods: {
    // Métodos do componente
  }
}
</script>

<style scoped>
.characters-page {
  padding: 20px;
}

.characters-container {
  max-width: 1200px;
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