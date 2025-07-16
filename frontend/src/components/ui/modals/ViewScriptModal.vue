<template>
  <div class="modal view-script-modal">
    <div class="modal-header">
      <h2>{{ script?.title || 'Roteiro sem título' }}</h2>
      <button class="close-btn" @click="closeModal('viewScript')">
        <span>&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <p v-if="script?.description" class="preview-description">{{ script.description }}</p>
      <div class="preview-header-actions">
        <button class="btn btn-sm btn-secondary" @click="exportScript">
          <span>📄</span> Exportar
        </button>
      </div>
      <div class="preview-messages">
        <div
          v-for="message in messages"
          :key="message.id || `preview-${message.order_index}`"
          class="preview-message"
          :style="{ borderLeftColor: message.character_color || '#6B7280' }"
        >
          <div class="preview-message-header">
            <strong v-if="message.character_name && message.character_name !== 'Texto de Ação'">
              {{ message.character_name }}
            </strong>
            <span v-else class="action-text">[Texto de Ação]</span>
          </div>
          <div class="preview-message-content">
            {{ message.message }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import scriptService from '@/services/scriptService'

export default {
  name: 'ViewScriptModalComponent',
  props: {
    script: {
      type: Object,
      required: true
    },
    messages: {
      type: Array,
      required: true
    }
  },
  methods: {
    ...mapActions({
      closeModal: 'ui/closeModal',
      showError: 'ui/showError',
      showSuccess: 'ui/showSuccess'
    }),
    async exportScript() {
      if (!this.script?.id) return
      const response = await scriptService.exportScript(this.script.id)
      if (!response.success) {
        this.showError('Erro ao exportar roteiro.')
      } else {
        this.showSuccess('Roteiro exportado com sucesso!')
      }
    }
  }
}
</script>

<style scoped>
.modal {
  background: var(--bg-primary);
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
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
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.preview-description {
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.preview-header-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.preview-messages {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-message {
  background: var(--bg-secondary);
  border-left: 4px solid #6B7280;
  padding: 12px 16px;
  border-radius: 6px;
}

.preview-message-header {
  font-weight: 600;
  margin-bottom: 4px;
}

.action-text {
  color: var(--text-muted);
  font-style: italic;
}

.preview-message-content {
  color: var(--text-primary);
}
</style>
