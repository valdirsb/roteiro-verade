<template>
  <div class="modal create-script-modal">
    <div class="modal-header">
      <h2>Novo Roteiro</h2>
      <button class="close-btn" @click="closeModal('createScript')">
        <span>&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="script-title">Título <span class="required">*</span></label>
          <input
            id="script-title"
            v-model="title"
            type="text"
            placeholder="Digite o título do roteiro"
            :class="{ 'input-error': titleError }"
            maxlength="100"
            autocomplete="off"
            :disabled="loading"
          />
          <span v-if="titleError" class="error-message">{{ titleError }}</span>
        </div>
        <div class="form-group">
          <label for="script-description">Descrição</label>
          <textarea
            id="script-description"
            v-model="description"
            placeholder="Digite uma descrição (opcional)"
            maxlength="500"
            :disabled="loading"
          ></textarea>
        </div>
        <div class="form-actions">
          <button type="submit" class="submit-btn" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            <span v-else>Criar Roteiro</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import scriptService from '@/services/scriptService'
import router from '@/router'

export default {
  name: 'CreateScriptModalComponent',
  data() {
    return {
      title: '',
      description: '',
      titleError: '',
      loading: false
    }
  },
  methods: {
    ...mapActions({
      closeModal: 'ui/closeModal',
      showSuccess: 'ui/showSuccess',
      showError: 'ui/showError'
    }),
    async handleSubmit() {
      this.titleError = ''
      if (!this.title.trim()) {
        this.titleError = 'O título é obrigatório.'
        return
      }
      this.loading = true
      try {
        const payload = {
          title: this.title.trim(),
          description: this.description.trim()
        }
        const response = await scriptService.createScript(payload)
        if (response.success && response.data.data && response.data.data.script && response.data.data.script.id) {
          this.showSuccess('Roteiro criado com sucesso!')
          this.closeModal('createScript')
          // Redireciona para edição do roteiro
          router.push({ name: 'ScriptEdit', params: { id: response.data.data.script.id } })
        } else if (response.error && response.error.type === 'auth') {
          this.showError('Você precisa estar autenticado para criar um roteiro.')
        } else {
          this.showError(response.error?.message || 'Erro ao criar roteiro.')
        }
      } catch {
        this.showError('Erro inesperado ao criar roteiro.')
      } finally {
        this.loading = false
      }
    }
  },
  mounted() {
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

.form-group {
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
}

label {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.required {
  color: #e74c3c;
  font-size: 14px;
}

input[type="text"],
textarea {
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 16px;
  color: var(--text-primary);
  background: var(--bg-secondary);
  outline: none;
  transition: border 0.2s;
}

.input-error {
  border-color: #e74c3c;
}

.error-message {
  color: #e74c3c;
  font-size: 13px;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

.submit-btn {
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 10px 22px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover {
  background: var(--primary-dark);
}

.spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid #fff;
  border-top: 2px solid var(--primary-dark);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin-right: 8px;
  vertical-align: middle;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
