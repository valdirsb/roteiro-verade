<template>
  <div class="script-editor-page">
    <div class="script-editor-container">
      <h1>{{ isEditing ? 'Editar' : 'Novo' }} Roteiro</h1>
      <p>Editor de roteiros em desenvolvimento.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ScriptEditorPage',
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
      // Dados do editor
    }
  },
  methods: {
    // Métodos do componente
  }
}
</script>

<style scoped>
.script-editor-page {
  padding: 20px;
}

.script-editor-container {
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