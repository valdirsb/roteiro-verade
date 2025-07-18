<template>
  <div class="modal create-character-modal">
    <div class="modal-header">
      <h2>{{ isEditMode ? 'Editar Personagem' : 'Novo Personagem' }}</h2>
      <button class="close-btn" @click="closeModal('createCharacter')">
        <span>&times;</span>
      </button>
    </div>

    <div class="modal-body">
      <form @submit.prevent="handleSubmit" class="character-form">
        <!-- Nome do Personagem -->
        <div class="form-group">
          <BaseInput
            v-model="form.name"
            label="Nome do Personagem"
            placeholder="Digite o nome do personagem"
            icon="fa-user"
            required
            :error="errors.name"
            :disabled="isSubmitting"
            @blur="validateField('name')"
          />
        </div>

        <!-- Cor do Personagem -->
        <div class="form-group">
          <label class="form-label">
            Cor do Personagem
            <span class="required">*</span>
          </label>
          <div class="color-picker">
            <div class="color-preview" :style="{ backgroundColor: form.color }" @click="triggerColorInput"></div>
              <input
                ref="colorInput"
                v-model="form.color"
                type="color"
                class="color-input"
                :disabled="isSubmitting"
                @change="validateField('color')"
              />
              <span class="color-value">{{ form.color }}</span>
            </div>
          <div v-if="errors.color" class="form-error">{{ errors.color }}</div>
        </div>



        <!-- Upload de Avatar -->
        <div class="form-group">
          <label class="form-label">
            Avatar
            <span class="optional">(opcional)</span>
          </label>
          <div class="avatar-upload">
            <div class="avatar-preview" @click="triggerFileInput">
              <img
                v-if="avatarPreview"
                :src="avatarPreview"
                alt="Preview do avatar"
                class="avatar-image"
              />
              <div v-else class="avatar-placeholder">
                <i class="fas fa-camera"></i>
                <span>Clique para selecionar uma imagem</span>
              </div>
            </div>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="file-input"
              @change="handleFileSelect"
            />
            <div class="avatar-info">
              <p class="avatar-hint">
                <i class="fas fa-info-circle"></i>
                Formatos aceitos: JPG, PNG, GIF. Máximo 5MB.
              </p>
              <button
                v-if="selectedFile"
                type="button"
                class="btn-remove-file"
                @click="removeFile"
                :disabled="isSubmitting"
              >
                <i class="fas fa-trash"></i>
                Remover arquivo
              </button>
            </div>
          </div>
          <div v-if="errors.avatar" class="form-error">{{ errors.avatar }}</div>
        </div>

        <!-- Botões -->
        <div class="form-actions">
          <BaseButton
            type="button"
            variant="outline"
            @click="closeModal('createCharacter')"
            :disabled="isSubmitting"
          >
            Cancelar
          </BaseButton>
          <BaseButton
            type="submit"
            variant="primary"
            :loading="isSubmitting"
            :disabled="!isFormValid || isSubmitting"
          >
            <i :class="isEditMode ? 'fas fa-save' : 'fas fa-plus'"></i>
            {{ isEditMode ? 'Salvar Alterações' : 'Criar Personagem' }}
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

export default {
  name: 'CreateCharacterModalComponent',

  components: {
    BaseInput,
    BaseButton
  },

  data() {
    return {
      form: {
        name: '',
        color: '#8B5CF6'
      },
      errors: {
        name: '',
        color: '',
        avatar: ''
      },
      selectedFile: null,
      avatarPreview: null,
      isSubmitting: false,
      isEditMode: false,
      editingId: null
    }
  },

  computed: {
    ...mapGetters({ modalData: 'ui/modalData' }),
    isFormValid() {
      return this.form.name.trim() &&
             this.form.color &&
             !this.errors.name &&
             !this.errors.color &&
             !this.errors.avatar
    }
  },

  watch: {
    modalData: {
      immediate: true,
      handler(data) {
        if (data && data.character) {
          this.isEditMode = true;
          this.editingId = data.character.id;
          this.form.name = data.character.name || '';
          this.form.color = data.character.color || '#8B5CF6';
          this.avatarPreview = data.character.avatar_url || data.character.image || null;
        } else {
          this.isEditMode = false;
          this.editingId = null;
          this.resetForm();
        }
      }
    }
  },

  mounted() {
    if (this.modalData && this.modalData.character) {
      this.isEditMode = true;
      this.editingId = this.modalData.character.id;
      this.form.name = this.modalData.character.name || '';
      this.form.color = this.modalData.character.color || '#8B5CF6';
      this.avatarPreview = this.modalData.character.avatar_url || this.modalData.character.image || null;
    }
  },

  methods: {
    ...mapActions({
      closeModal: 'ui/closeModal',
      createCharacter: 'characters/createCharacter',
      updateCharacter: 'characters/updateCharacter',
      setSuccess: 'ui/setSuccess',
      showError: 'ui/showError'
    }),

    validateField(field) {
      this.errors[field] = ''

      switch (field) {
        case 'name':
          if (!this.form.name.trim()) {
            this.errors.name = 'Nome é obrigatório'
          } else if (this.form.name.trim().length < 2) {
            this.errors.name = 'Nome deve ter pelo menos 2 caracteres'
          } else if (this.form.name.trim().length > 50) {
            this.errors.name = 'Nome deve ter no máximo 50 caracteres'
          }
          break

        case 'color':
          if (!this.form.color) {
            this.errors.color = 'Cor é obrigatória'
          } else if (!/^#[0-9A-F]{6}$/i.test(this.form.color)) {
            this.errors.color = 'Cor deve estar no formato hexadecimal (#RRGGBB)'
          }
          break

        case 'avatar':
          if (this.selectedFile) {
            const maxSize = 5 * 1024 * 1024 // 5MB
            if (this.selectedFile.size > maxSize) {
              this.errors.avatar = 'Arquivo deve ter no máximo 5MB'
            }

            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
            if (!allowedTypes.includes(this.selectedFile.type)) {
              this.errors.avatar = 'Formato de arquivo não suportado. Use JPG, PNG ou GIF'
            }
          }
          break
      }
    },

    validateForm() {
      this.validateField('name')
      this.validateField('color')
      this.validateField('avatar')

      return this.isFormValid
    },

    triggerFileInput() {
      this.$refs.fileInput.click()
    },

    handleFileSelect(event) {
      const file = event.target.files[0]
      if (!file) return

      this.selectedFile = file
      this.errors.avatar = ''

      // Criar preview
      const reader = new FileReader()
      reader.onload = (e) => {
        this.avatarPreview = e.target.result
      }
      reader.readAsDataURL(file)

      // Validar arquivo
      this.validateField('avatar')
    },

    removeFile() {
      this.selectedFile = null
      this.avatarPreview = null
      this.errors.avatar = ''
      this.$refs.fileInput.value = ''
    },

    triggerColorInput() {
      if (this.$refs.colorInput) {
        this.$refs.colorInput.click();
      }
    },

    async handleSubmit() {
      if (!this.validateForm()) {
        return
      }

      this.isSubmitting = true

      try {
        // Preparar dados do personagem
        const characterData = {
          name: this.form.name.trim(),
          color: this.form.color
        }

        // Criar personagem com arquivo (se houver)
        let result
        if (this.isEditMode && this.editingId) {
          result = await this.updateCharacter({ id: this.editingId, characterData })
        } else {
          result = await this.createCharacter({ characterData, file: this.selectedFile })
        }
        console.log('Resultado da criação/edição do personagem:', result)

        if (result.success) {
          this.setSuccess(this.isEditMode ? 'Personagem atualizado com sucesso!' : 'Personagem criado com sucesso!')
          this.closeModal('createCharacter')
          this.resetForm()
        } else {
          this.showError(result.error?.message || (this.isEditMode ? 'Erro ao atualizar personagem' : 'Erro ao criar personagem'))
        }
      } catch (error) {
        console.error('Erro ao criar/editar personagem:', error)
        this.showError(this.isEditMode ? 'Erro inesperado ao atualizar personagem' : 'Erro inesperado ao criar personagem')
      } finally {
        this.isSubmitting = false
      }
    },



    resetForm() {
      this.form = {
        name: '',
        color: '#8B5CF6'
      }
      this.errors = {
        name: '',
        color: '',
        avatar: ''
      }
      this.selectedFile = null
      this.avatarPreview = null
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    }
  }
}
</script>

<style scoped>
.modal {
  background: var(--bg-primary);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-xl);
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
  padding: 24px 32px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-muted);
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-sm);
  transition: all var(--transition-normal);
}

.close-btn:hover {
  color: var(--text-primary);
  background: var(--bg-secondary);
}

.modal-body {
  padding: 32px;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.character-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

.required {
  color: var(--error-color);
}

.optional {
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 400;
}

.form-error {
  color: var(--error-color);
  font-size: 0.75rem;
  margin-top: 4px;
}

/* Color Picker */
.color-picker {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  background: var(--bg-primary);
  transition: all var(--transition-normal);
}

.color-picker:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.color-preview {
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius-md);
  border: 2px solid var(--border-color);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.color-preview:hover {
  transform: scale(1.05);
}

.color-input {
  width: 0;
  height: 0;
  opacity: 0;
  position: absolute;
}

.color-value {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}



/* Avatar Upload */
.avatar-upload {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.avatar-preview {
  width: 120px;
  height: 120px;
  border: 2px dashed var(--border-color);
  border-radius: var(--border-radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-normal);
  background: var(--bg-secondary);
  overflow: hidden;
}

.avatar-preview:hover {
  border-color: var(--primary-color);
  background: var(--bg-tertiary);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  text-align: center;
}

.avatar-placeholder i {
  font-size: 2rem;
  opacity: 0.6;
}

.avatar-placeholder span {
  font-size: 0.75rem;
  max-width: 80px;
  line-height: 1.3;
}

.file-input {
  display: none;
}

.avatar-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.avatar-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.avatar-hint i {
  color: var(--info-color);
}

.btn-remove-file {
  background: none;
  border: none;
  color: var(--error-color);
  font-size: 0.75rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--border-radius-sm);
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: 4px;
  align-self: flex-start;
}

.btn-remove-file:hover {
  background: var(--error-color);
  color: white;
}

.btn-remove-file:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

/* Responsividade */
@media (max-width: 768px) {
  .modal {
    max-width: 95vw;
    margin: 20px;
  }

  .modal-header {
    padding: 20px 24px;
  }

  .modal-body {
    padding: 24px;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .color-picker {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .avatar-preview {
    width: 100px;
    height: 100px;
  }
}

/* Animações */
.modal {
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.avatar-preview {
  animation: fadeInScale 0.3s ease-out;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
