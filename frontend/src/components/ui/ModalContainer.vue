<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="hasOpenModals"
        class="modal-overlay"
        @click="closeAllModals"
      >
        <div
          class="modal-container"
          @click.stop
        >
          <!-- Modal de Login -->
          <Transition name="modal-content">
            <LoginModal v-if="isModalOpen('login')" />
          </Transition>

          <!-- Modal de Registro -->
          <Transition name="modal-content">
            <RegisterModal v-if="isModalOpen('register')" />
          </Transition>

          <!-- Modal de Criar Roteiro -->
          <Transition name="modal-content">
            <CreateScriptModal v-if="isModalOpen('createScript')" />
          </Transition>

          <!-- Modal de Criar Personagem -->
          <Transition name="modal-content">
            <CreateCharacterModal v-if="isModalOpen('createCharacter')" />
          </Transition>

          <!-- Modal de Compartilhar Roteiro -->
          <Transition name="modal-content">
            <ShareScriptModal v-if="isModalOpen('shareScript')" />
          </Transition>

          <!-- Modal de Confirmação -->
          <Transition name="modal-content">
            <ConfirmModal v-if="isModalOpen('confirmDelete')" />
          </Transition>

          <!-- Modal de Configurações -->
          <Transition name="modal-content">
            <SettingsModal v-if="isModalOpen('settings')" />
          </Transition>

          <!-- Modal de Visualização de Roteiro -->
          <Transition name="modal-content">
            <ViewScriptModal v-if="isModalOpen('viewScript')" :script="modalData?.script" :messages="modalData?.messages" />
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import LoginModal from './modals/LoginModal.vue'
import RegisterModal from './modals/RegisterModal.vue'
import CreateScriptModal from './modals/CreateScriptModal.vue'
import CreateCharacterModal from './modals/CreateCharacterModal.vue'
import ShareScriptModal from './modals/ShareScriptModal.vue'
import ConfirmModal from './modals/ConfirmModal.vue'
import SettingsModal from './modals/SettingsModal.vue'
import ViewScriptModal from './modals/ViewScriptModal.vue'

export default {
  name: 'ModalContainer',

  components: {
    LoginModal,
    RegisterModal,
    CreateScriptModal,
    CreateCharacterModal,
    ShareScriptModal,
    ConfirmModal,
    SettingsModal,
    ViewScriptModal
  },

  computed: {
    ...mapGetters({
      hasOpenModals: 'ui/hasOpenModals',
      isModalOpen: 'ui/isModalOpen',
      modalData: 'ui/modalData'
    })
  },

  methods: {
    ...mapActions({
      closeAllModals: 'ui/closeAllModals'
    }),

    handleKeydown(event) {
      if (event.key === 'Escape' && this.hasOpenModals) {
        this.closeAllModals()
      }
    }
  },

  mounted() {
    // Fechar modais com ESC
    document.addEventListener('keydown', this.handleKeydown)
  },

  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeydown)
  }
}
</script>

<style scoped>
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
  z-index: 10000;
  padding: 20px;
  height: 100vh;
  overflow-y: auto;
}

.modal-container {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

/* Animações do overlay */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Animações do conteúdo */
.modal-content-enter-active,
.modal-content-leave-active {
  transition: all 0.3s ease;
}

.modal-content-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}

.modal-content-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}

/* Responsividade */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }

  .modal-container {
    max-width: 95vw;
    max-height: 95vh;
  }
}
</style>
