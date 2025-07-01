<template>
  <div class="modal share-script-modal">
    <div class="modal-header">
      <h2>Compartilhar Roteiro</h2>
      <button class="close-btn" @click="closeModal('shareScript')">
        <span>&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <p>Modal de compartilhar roteiro em desenvolvimento.</p>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'ShareScriptModalComponent',
  methods: {
    ...mapActions({
      closeModal: 'ui/closeModal'
    })
  }
}
</script>

<style scoped>
.modal {
  background: var(--bg-primary);
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 100%;
  display: block !important;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  margin: 0;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-muted);
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: var(--text-primary);
}

.modal-body {
  padding: 20px;
}

p {
  color: var(--text-secondary);
  margin: 0;
}
</style>
