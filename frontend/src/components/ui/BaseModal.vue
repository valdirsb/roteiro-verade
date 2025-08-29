<template>
  <div class="base-modal">
    <div class="base-modal__header">
      <h2 class="base-modal__title">{{ title }}</h2>
      <button
        class="base-modal__close"
        @click="$emit('close')"
        aria-label="Fechar modal"
      >
        <i class="fas fa-xmark"></i>
      </button>
    </div>

    <div class="base-modal__body">
      <slot />
    </div>

    <div v-if="$slots.footer" class="base-modal__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseModal',

  props: {
    title: {
      type: String,
      required: true
    }
  },

  emits: ['close']
}
</script>

<style scoped>
.base-modal {
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  min-width: 400px;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.base-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.base-modal__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.base-modal__close {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-size: 1.1rem;
}

.base-modal__close:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.base-modal__body {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

.base-modal__footer {
  padding: 20px 24px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* Responsividade */
@media (max-width: 768px) {
  .base-modal {
    min-width: auto;
    width: 100%;
    max-height: 90vh;
  }

  .base-modal__header {
    padding: 16px 20px;
  }

  .base-modal__body {
    padding: 20px;
  }

  .base-modal__footer {
    padding: 16px 20px;
    flex-direction: column;
  }

  .base-modal__footer > * {
    width: 100%;
  }
}

/* Tema escuro */
[data-theme="dark"] .base-modal {
  border: 1px solid var(--border-color);
}
</style>
