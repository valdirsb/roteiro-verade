<template>
  <div class="character-form-page">
    <div class="character-form-container">
      <h1>{{ isEditing ? 'Editar' : 'Novo' }} Personagem</h1>
      <p>Formulário de personagem em desenvolvimento.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CharacterFormPage',
  props: {
    id: {
      type: [String, Number],
      default: null
    }
  },
  computed: {
    isEditing() {
      return !!this.id
    }
  },
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
.character-form-page {
  padding: 20px;
}

.character-form-container {
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