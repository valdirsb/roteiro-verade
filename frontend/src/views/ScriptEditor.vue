<template>
  <div class="script-editor-page">
    <div class="script-editor-container">
      <!-- Header do Editor -->
      <div class="editor-header">
        <div class="header-left">
          <h1>{{ isEditing ? 'Editar' : 'Novo' }} Roteiro</h1>
          <p v-if="script">{{ script.title || 'Sem título' }}</p>
        </div>
        <div class="header-actions">
          <button
            class="btn btn-secondary"
            @click="saveDraft"
            :disabled="isSaving"
          >
            <span v-if="isSaving">Salvando...</span>
            <span v-else>Salvar Rascunho</span>
          </button>
          <button
            class="btn btn-primary"
            @click="saveScript"
            :disabled="isSaving || !canSave"
          >
            <span v-if="isSaving">Salvando...</span>
            <span v-else>{{ isEditing ? 'Atualizar' : 'Criar' }} Roteiro</span>
          </button>
        </div>
      </div>

      <!-- Conteúdo Principal -->
      <div class="editor-content">
        <!-- Painel Esquerdo - Informações e Personagens -->
        <div class="editor-sidebar">
          <!-- Informações do Roteiro -->
          <div class="script-info-panel">
            <h3>Informações do Roteiro</h3>
            <div class="form-group">
              <label for="script-title">Título</label>
              <input
                id="script-title"
                v-model="scriptForm.title"
                type="text"
                class="form-input"
                placeholder="Digite o título do roteiro"
                @input="updateScriptTitle"
              >
            </div>
            <div class="form-group">
              <label for="script-description">Descrição</label>
              <textarea
                id="script-description"
                v-model="scriptForm.description"
                class="form-textarea"
                placeholder="Digite a descrição do roteiro"
                rows="3"
                @input="updateScriptDescription"
              ></textarea>
            </div>
            <div class="form-group">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="scriptForm.is_public"
                  @change="updateScriptVisibility"
                >
                <span class="checkmark"></span>
                Roteiro público
              </label>
            </div>
          </div>

          <!-- Lista de Personagens -->
          <div class="characters-panel">
            <div class="panel-header">
              <h3>Personagens</h3>
              <button class="btn btn-sm btn-primary" @click="showCreateCharacterModal">
                <span>+</span>
              </button>
            </div>
            <div class="characters-list">
              <div
                v-for="character in availableCharacters"
                :key="character.id"
                class="character-item"
                :class="{ active: selectedCharacter?.id === character.id }"
                @click="selectCharacter(character)"
              >
                <div class="character-avatar" :style="{ backgroundColor: character.color }">
                  <img v-if="character.avatar_url" :src="getCharacterAvatarUrl(character.avatar_url)" :alt="character.name">
                  <span v-else>{{ character.name.charAt(0).toUpperCase() }}</span>
                </div>
                <div class="character-info">
                  <span class="character-name">{{ character.name }}</span>
                  <span class="character-messages">{{ getCharacterMessageCount(character.id) }} mensagens</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Painel Central - Editor de Mensagens -->
        <div class="editor-main">
          <!-- Barra de Ferramentas -->
          <div class="editor-toolbar">
            <div class="toolbar-left">
              <button
                class="btn btn-sm btn-secondary"
                @click="addMessageButtom"
                :disabled="!selectedCharacter"
              >
                <span>+</span> Adicionar Mensagem
              </button>
              <button
                class="btn btn-sm btn-secondary"
                @click="addActionText"
              >
                <span>🎬</span> Texto de Ação
              </button>
            </div>
            <div class="toolbar-right">
              <button
                class="btn btn-sm btn-secondary"
                @click="togglePreview"
              >
                <span>{{ showPreview ? '✏️' : '👁️' }}</span>
                {{ showPreview ? 'Editar' : 'Visualizar' }}
              </button>
            </div>
          </div>

          <!-- Lista de Mensagens -->
          <div class="messages-container">
            <div
              v-for="(message, index) in scriptMessagesLocal"
              :key="message.id || `temp-${index}`"
              class="message-item"
              :class="{ editing: editingMessage?.id === message.id }"
            >
              <!-- Cabeçalho da Mensagem -->
              <div class="message-header">
                <div class="message-character">
                  <div class="character-avatar small" :style="{ backgroundColor: message.character_color || '#6B7280' }">
                    <img v-if="message.character_avatar" :src="getCharacterAvatarUrl(message.character_avatar)" :alt="message.character_name">
                    <span v-else>{{ (message.character_name || 'Ação').charAt(0).toUpperCase() }}</span>
                  </div>
                  <span class="character-name">{{ message.character_name || 'Texto de Ação' }}</span>
                </div>
                <div class="message-actions">
                  <button class="btn btn-sm btn-icon" @click="editMessage(message)">
                    <span>✏️</span>
                  </button>
                  <button class="btn btn-sm btn-icon" @click="duplicateMessage(message)">
                    <span>📋</span>
                  </button>
                  <button class="btn btn-sm btn-icon danger" @click="deleteMessage(message)">
                    <span>🗑️</span>
                  </button>
                </div>
              </div>

              <!-- Conteúdo da Mensagem -->
              <div class="message-content">
                <textarea
                  v-if="editingMessage?.id === message.id"
                  v-model="editingMessage.message"
                  class="message-textarea"
                  placeholder="Digite a mensagem..."
                  @blur="saveMessageEdit"
                  @keydown.ctrl.enter="saveMessageEdit"
                  ref="messageTextarea"
                ></textarea>
                <div v-else class="message-text" @click="editMessage(message)">
                  {{ message.message || 'Clique para editar...' }}
                </div>
              </div>

              <!-- Controles de Ordenação -->
              <div class="message-controls">
                <button
                  class="btn btn-sm btn-icon"
                  @click="moveMessageUp(index)"
                  :disabled="index === 0"
                >
                  <span>⬆️</span>
                </button>
                <button
                  class="btn btn-sm btn-icon"
                  @click="moveMessageDown(index)"
                  :disabled="index === scriptMessagesLocal.length - 1"
                >
                  <span>⬇️</span>
                </button>
              </div>
            </div>

            <!-- Mensagem Vazia -->
            <div v-if="scriptMessagesLocal.length === 0" class="empty-messages">
              <div class="empty-icon">📝</div>
              <h3>Nenhuma mensagem ainda</h3>
              <p>Selecione um personagem e adicione a primeira mensagem do seu roteiro.</p>
            </div>
          </div>
        </div>

        <!-- Painel Direito - Visualização -->
        <div class="preview-panel" v-if="showPreview">
          <div class="preview-header">
            <h3>Visualização</h3>
            <button class="btn btn-sm btn-secondary" @click="exportScript">
              <span>📄</span> Exportar
            </button>
          </div>
          <div class="preview-content">
            <div class="script-preview">
              <h2 class="preview-title">{{ scriptForm.title || 'Roteiro sem título' }}</h2>
              <p v-if="scriptForm.description" class="preview-description">{{ scriptForm.description }}</p>

              <div class="preview-messages">
                <div
                  v-for="message in scriptMessagesLocal"
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
        </div>
      </div>
    </div>

    <!-- Modal de Criação de Personagem -->
    <div v-if="showCharacterModal" class="modal-overlay" @click="closeCharacterModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Novo Personagem</h3>
          <button class="btn btn-icon" @click="closeCharacterModal">
            <span>&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="character-name">Nome</label>
            <input
              id="character-name"
              v-model="newCharacter.name"
              type="text"
              class="form-input"
              placeholder="Digite o nome do personagem"
            >
          </div>
          <div class="form-group">
            <label for="character-color">Cor</label>
            <input
              id="character-color"
              v-model="newCharacter.color"
              type="color"
              class="form-input color-input"
            >
          </div>
          <div class="form-group">
            <label for="character-avatar">Avatar (URL)</label>
            <input
              id="character-avatar"
              v-model="newCharacter.avatar_url"
              type="url"
              class="form-input"
              placeholder="https://exemplo.com/avatar.jpg"
            >
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeCharacterModal">Cancelar</button>
          <button
            class="btn btn-primary"
            @click="createCharacter"
            :disabled="!newCharacter.name"
          >
            Criar Personagem
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import { getCharacterAvatarUrl } from '@/utils/backendConfig'

export default {
  name: 'ScriptEditorPage',
  props: {
    id: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      scriptForm: {
        title: '',
        description: '',
        is_public: false
      },
      scriptMessagesLocal: [],
      selectedCharacter: null,
      editingMessage: null,
      showPreview: false,
      showCharacterModal: false,
      newCharacter: {
        name: '',
        color: '#8B5CF6',
        avatar_url: ''
      },
      isSaving: false,
      autoSaveInterval: null
    }
  },
  computed: {
    ...mapState('scripts', ['currentScript', 'scriptMessages']),
    ...mapState('characters', ['characters']),
    ...mapGetters('auth', ['isAuthenticated', 'currentUser']),

    isEditing() {
      return !!this.id
    },

    script() {
      return this.currentScript
    },

    availableCharacters() {
      return this.characters.data.characters.filter(char => char.is_active !== false)
    },

    canSave() {
      return this.scriptForm.title.trim() && this.scriptMessagesLocal.length > 0
    }
  },
  async created() {
    await this.initializeEditor()
    this.setupAutoSave()
  },
  beforeUnmount() {
    this.clearAutoSave()
  },
  methods: {
    ...mapActions('scripts', [
      'loadScript',
      'createScript',
      'updateScript',
      'loadScriptMessages',
      'addMessage',
      'updateMessage',
      'deleteMessage',
      'reorderMessages'
    ]),
    ...mapActions('characters', ['loadCharacters', 'createCharacter']),
    ...mapActions('ui', ['showSuccess', 'showError']),

    async initializeEditor() {
      try {
        // Carregar personagens
        await this.loadCharacters()

        if (this.isEditing) {
          // Carregar roteiro existente
          const scriptResult = await this.loadScript(this.id)
          if (scriptResult.success) {
            this.scriptForm = {
              title: this.script.data.script.title || '',
              description: this.script.data.script.description || '',
              is_public: this.script.data.script.is_public || false
            }

            // Carregar mensagens
            await this.loadScriptMessages(this.id)
            this.scriptMessagesLocal = [...this.scriptMessages.data.messages]
          }
        } else {
          // Novo roteiro - carregar personagens padrão
          this.scriptMessagesLocal = []
        }
      } catch (error) {
        this.showError('Erro ao carregar dados do editor')
        console.error('Erro ao inicializar editor:', error)
      }
    },

    setupAutoSave() {
      this.autoSaveInterval = setInterval(() => {
        if (this.isEditing && this.hasChanges()) {
          this.saveDraft()
        }
      }, 60000) // Auto-save a cada 60 segundos
    },

    clearAutoSave() {
      if (this.autoSaveInterval) {
        clearInterval(this.autoSaveInterval)
        this.autoSaveInterval = null
      }
    },

    hasChanges() {
      if (!this.script) return false

      return (
        this.scriptForm.title !== this.script.data.script.title ||
        this.scriptForm.description !== this.script.data.script.description ||
        this.scriptForm.is_public !== this.script.data.script.is_public ||
        this.scriptMessagesLocal.length !== this.scriptMessagesLocal.length
      )
    },

    updateScriptTitle() {
      // Atualização em tempo real
    },

    updateScriptDescription() {
      // Atualização em tempo real
    },

    updateScriptVisibility() {
      // Atualização em tempo real
    },

    selectCharacter(character) {
      this.selectedCharacter = character
    },

    addMessageButtom() {
      if (!this.selectedCharacter) {
        this.showError('Selecione um personagem primeiro')
        return
      }

      const newMessage = {
        id: `temp-${Date.now()}`,
        script_id: this.id,
        character_id: this.selectedCharacter.id,
        character_name: this.selectedCharacter.name,
        character_color: this.selectedCharacter.color,
        character_avatar: this.selectedCharacter.avatar_url,
        message: '',
        order_index: this.scriptMessagesLocal.length,
        created_at: new Date().toISOString()
      }

      this.scriptMessagesLocal.push(newMessage)
      this.editMessage(newMessage)
    },

    addActionText() {
      const actionMessage = {
        id: `temp-${Date.now()}`,
        script_id: this.id,
        character_id: null,
        character_name: 'Texto de Ação',
        character_color: '#6B7280',
        character_avatar: null,
        message: '',
        order_index: this.scriptMessagesLocal.length,
        created_at: new Date().toISOString()
      }

      this.scriptMessagesLocal.push(actionMessage)
      this.editMessage(actionMessage)
    },

    editMessage(message) {
      this.editingMessage = { ...message }
      this.$nextTick(() => {
        if (this.$refs.messageTextarea) {
          this.$refs.messageTextarea[0]?.focus()
        }
      })
    },

    async saveMessageEdit() {
      if (!this.editingMessage) return

      try {
        if (this.editingMessage.id.toString().startsWith('temp-')) {
          // Nova mensagem
          const messageData = {
            character_id: this.editingMessage.character_id,
            message: this.editingMessage.message,
            order_index: this.editingMessage.order_index
          }

          const result = await this.addMessage({
            scriptId: this.id,
            messageData
          })

          if (result.success) {
            // Substituir mensagem temporária pela real
            const index = this.scriptMessagesLocal.findIndex(m => m.id === this.editingMessage.id)
            if (index !== -1) {
              this.scriptMessagesLocal.splice(index, 1, result.message)
            }
          }
        } else {
          // Mensagem existente
          const result = await this.updateMessage({
            scriptId: this.id,
            messageId: this.editingMessage.id,
            messageData: {
              message: this.editingMessage.message
            }
          })

          console.log("API:", result)

          if (result.success) {
            const index = this.scriptMessagesLocal.findIndex(m => m.id === this.editingMessage.id)
            if (index !== -1) {
              this.scriptMessagesLocal.splice(index, 1, result.message)
            }
          }
        }

        this.editingMessage = null
      } catch (error) {
        this.showError('Erro ao salvar mensagem')
        console.error('Erro ao salvar mensagem:', error)
      }
    },

    async duplicateMessage(message) {
      const duplicatedMessage = {
        ...message,
        id: `temp-${Date.now()}`,
        message: `${message.message} (cópia)`,
        order_index: this.scriptMessagesLocal.length
      }

      this.scriptMessagesLocal.push(duplicatedMessage)
      this.editMessage(duplicatedMessage)
    },

    async deleteMessage(message) {
      if (confirm('Tem certeza que deseja excluir esta mensagem?')) {
        try {
          if (!message.id.toString().startsWith('temp-')) {
            await this.deleteMessage({
              scriptId: this.id,
              messageId: message.id
            })
          }

          const index = this.scriptMessagesLocal.findIndex(m => m.id === message.id)
          if (index !== -1) {
            this.scriptMessagesLocal.splice(index, 1)
          }

          this.reorderMessages()
        } catch (error) {
          this.showError('Erro ao excluir mensagem')
          console.error('Erro ao excluir mensagem:', error)
        }
      }
    },

    moveMessageUp(index) {
      if (index > 0) {
        const temp = this.scriptMessagesLocal[index]
        this.scriptMessagesLocal[index] = this.scriptMessagesLocal[index - 1]
        this.scriptMessagesLocal[index - 1] = temp
        this.reorderMessages()
      }
    },

    moveMessageDown(index) {
      if (index < this.scriptMessagesLocal.length - 1) {
        const temp = this.scriptMessagesLocal[index]
        this.scriptMessagesLocal[index] = this.scriptMessagesLocal[index + 1]
        this.scriptMessagesLocal[index + 1] = temp
        this.reorderMessages()
      }
    },

    async reorderMessages() {
      // Atualizar índices de ordem
      this.scriptMessagesLocal.forEach((message, index) => {
        message.order_index = index
      })

      // Salvar nova ordem no servidor
      if (this.isEditing) {
        try {
          const messageIds = this.scriptMessagesLocal
            .filter(m => !m.id.toString().startsWith('temp-'))
            .map(m => m.id)

          if (messageIds.length > 0) {
            await this.reorderMessages({
              scriptId: this.id,
              messageIds
            })
          }
        } catch (error) {
          console.error('Erro ao reordenar mensagens:', error)
        }
      }
    },

    getCharacterMessageCount(characterId) {
      return this.scriptMessagesLocal.filter(m => m.character_id === characterId).length
    },

    togglePreview() {
      this.showPreview = !this.showPreview
    },

    async saveDraft() {
      if (!this.isEditing) return

      this.isSaving = true
      try {
        await this.updateScript({
          id: this.id,
          scriptData: this.scriptForm
        })
        this.showSuccess('Rascunho salvo automaticamente')
      } catch (error) {
        this.showError('Erro ao salvar rascunho')
        console.error('Erro ao salvar rascunho:', error)
      } finally {
        this.isSaving = false
      }
    },

    async saveScript() {
      if (!this.canSave) {
        this.showError('Preencha o título e adicione pelo menos uma mensagem')
        return
      }

      this.isSaving = true
      try {
        if (this.isEditing) {
          await this.updateScript({
            id: this.id,
            scriptData: this.scriptForm
          })
          this.setSuccess('Roteiro atualizado com sucesso!')
        } else {
          const result = await this.createScript(this.scriptForm)
          if (result.success) {
            this.$router.push(`/scripts/${result.script.id}/edit`)
            this.showSuccess('Roteiro criado com sucesso!')
          }
        }
      } catch (error) {
        this.showError('Erro ao salvar roteiro')
        console.error('Erro ao salvar roteiro:', error)
      } finally {
        this.isSaving = false
      }
    },

    showCreateCharacterModal() {
      this.showCharacterModal = true
      this.newCharacter = {
        name: '',
        color: '#8B5CF6',
        avatar_url: ''
      }
    },

    closeCharacterModal() {
      this.showCharacterModal = false
    },

    async createCharacter() {
      if (!this.newCharacter.name.trim()) {
        this.showError('Digite o nome do personagem')
        return
      }

      try {
        const result = await this.createCharacter(this.newCharacter)
        if (result.success) {
          this.closeCharacterModal()
          this.selectCharacter(result.character)
          this.showSuccess('Personagem criado com sucesso!')
        }
      } catch (error) {
        this.showError('Erro ao criar personagem')
        console.error('Erro ao criar personagem:', error)
      }
    },

    exportScript() {
      const scriptData = {
        title: this.scriptForm.title,
        description: this.scriptForm.description,
        is_public: this.scriptForm.is_public,
        messages: this.scriptMessagesLocal.map(m => ({
          character_name: m.character_name,
          message: m.message,
          order_index: m.order_index
        }))
      }

      const blob = new Blob([JSON.stringify(scriptData, null, 2)], {
        type: 'application/json'
      })

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${this.scriptForm.title || 'roteiro'}_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    },

    getCharacterAvatarUrl
  }
}
</script>

<style scoped>
.script-editor-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
}

.script-editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 100%;
  margin: 0;
  height: 100%;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.header-left h1 {
  margin: 0 0 5px 0;
  color: var(--text-primary);
  font-size: 1.5rem;
}

.header-left p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.editor-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.editor-sidebar {
  width: 300px;
  background: var(--bg-primary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.script-info-panel,
.characters-panel {
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.script-info-panel h3,
.characters-panel h3 {
  margin: 0 0 15px 0;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.9rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: border-color var(--transition-fast);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.color-input {
  height: 40px;
  padding: 4px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.checkbox-label input[type="checkbox"] {
  margin-right: 8px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.characters-list {
  max-height: 300px;
  overflow-y: auto;
}

.character-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  margin-bottom: 5px;
}

.character-item:hover {
  background: var(--bg-tertiary);
}

.character-item.active {
  background: var(--primary-color);
  color: white;
}

.character-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-weight: bold;
  color: white;
  font-size: 0.8rem;
}

.character-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.character-avatar.small {
  width: 24px;
  height: 24px;
  font-size: 0.7rem;
}

.character-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.character-name {
  font-weight: 500;
  font-size: 0.9rem;
}

.character-messages {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.character-item.active .character-messages {
  color: rgba(255, 255, 255, 0.8);
}

.editor-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 10px;
}

.messages-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.message-item {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  margin-bottom: 15px;
  transition: box-shadow var(--transition-fast);
}

.message-item:hover {
  box-shadow: var(--shadow-md);
}

.message-item.editing {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-tertiary);
  border-radius: var(--border-radius) var(--border-radius) 0 0;
}

.message-character {
  display: flex;
  align-items: center;
}

.message-actions {
  display: flex;
  gap: 5px;
}

.message-content {
  padding: 15px;
}

.message-textarea {
  width: 100%;
  min-height: 80px;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
  resize: vertical;
}

.message-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.message-text {
  color: var(--text-primary);
  line-height: 1.5;
  cursor: pointer;
  min-height: 20px;
}

.message-text:hover {
  background: var(--bg-tertiary);
  border-radius: var(--border-radius-sm);
  padding: 5px;
  margin: -5px;
}

.message-controls {
  display: flex;
  justify-content: center;
  gap: 5px;
  padding: 10px 15px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-tertiary);
  border-radius: 0 0 var(--border-radius) var(--border-radius);
}

.empty-messages {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.empty-messages h3 {
  margin: 0 0 10px 0;
  color: var(--text-primary);
}

.empty-messages p {
  margin: 0;
  font-size: 0.9rem;
}

.preview-panel {
  width: 350px;
  background: var(--bg-primary);
  border-left: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.preview-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.preview-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.script-preview {
  max-width: 100%;
}

.preview-title {
  margin: 0 0 10px 0;
  color: var(--text-primary);
  font-size: 1.3rem;
}

.preview-description {
  margin: 0 0 20px 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.4;
}

.preview-messages {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.preview-message {
  border-left: 3px solid;
  padding-left: 15px;
  background: var(--bg-secondary);
  padding: 15px;
  border-radius: var(--border-radius-sm);
}

.preview-message-header {
  margin-bottom: 8px;
}

.preview-message-header strong {
  color: var(--text-primary);
  font-size: 0.9rem;
}

.action-text {
  color: var(--text-muted);
  font-style: italic;
  font-size: 0.8rem;
}

.preview-message-content {
  color: var(--text-primary);
  line-height: 1.5;
  font-size: 0.9rem;
}

/* Botões */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: var(--border-radius-sm);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-quaternary);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.8rem;
}

.btn-icon {
  padding: 6px;
  min-width: 32px;
  justify-content: center;
}

.btn-icon.danger:hover {
  background: var(--error-color);
  color: white;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
}

.modal {
  background: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid var(--border-color);
}

/* Responsividade */
@media (max-width: 1200px) {
  .preview-panel {
    display: none;
  }
}

@media (max-width: 768px) {
  .editor-sidebar {
    width: 250px;
  }

  .editor-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 640px) {
  .editor-content {
    flex-direction: column;
  }

  .editor-sidebar {
    width: 100%;
    max-height: 200px;
  }

  .editor-toolbar {
    flex-direction: column;
    gap: 10px;
  }

  .toolbar-left,
  .toolbar-right {
    width: 100%;
    justify-content: center;
  }
}
</style>