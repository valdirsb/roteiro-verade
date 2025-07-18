<template>
  <div class="modal confirm-modal">
    <div class="modal-header">
      <h2>Confirmar</h2>
      <button class="close-btn" @click="closeModal('confirmDelete')">
        <span>&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <p>Tem certeza que deseja excluir o personagem <strong>{{ modalData.character?.name }}</strong>?</p>
      <div class="actions">
        <button class="btn btn-outline" @click="closeModal('confirmDelete')">Cancelar</button>
        <button class="btn btn-danger" @click="confirm">Excluir</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'ConfirmModalComponent',
  computed: {
    ...mapGetters({ modalData: 'ui/modalData' })
  },
  methods: {
    ...mapActions({
      closeModal: 'ui/closeModal',
      deleteCharacter: 'characters/deleteCharacter',
      setSuccess: 'ui/setSuccess',
      showError: 'ui/showError'
    }),
    async confirm() {
      if (this.modalData && this.modalData.character) {
        const id = this.modalData.character.id
        const result = await this.deleteCharacter(id)
        if (result.success) {
          this.setSuccess('Personagem excluído com sucesso!')
        } else {
          this.showError(result.error?.message || 'Erro ao excluir personagem')
        }
      }
      this.closeModal('confirmDelete')
    }
  }
}
</script>

<style scoped>
.modal {
  background: var(--bg-primary);
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 400px;
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

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
.btn {
  padding: 8px 18px;
  border-radius: 4px;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-outline {
  background: none;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}
.btn-danger {
  background: var(--error-color);
  color: #fff;
}
.btn-danger:hover {
  background: #c53030;
}
</style>
