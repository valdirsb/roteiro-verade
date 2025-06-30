<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="type"
    @click="handleClick"
  >
    <i v-if="loading" class="fas fa-spinner fa-spin button__loading"></i>
    <i v-else-if="icon" :class="iconClass"></i>
    
    <span v-if="$slots.default" class="button__text">
      <slot />
    </span>
  </button>
</template>

<script>
export default {
  name: 'BaseButton',
  
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: value => ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'ghost', 'outline'].includes(value)
    },
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    icon: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'button',
      validator: value => ['button', 'submit', 'reset'].includes(value)
    },
    fullWidth: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    buttonClasses() {
      return [
        'button',
        `button--${this.variant}`,
        `button--${this.size}`,
        {
          'button--disabled': this.disabled,
          'button--loading': this.loading,
          'button--full-width': this.fullWidth,
          'button--icon-only': !this.$slots.default && this.icon
        }
      ]
    },

    iconClass() {
      return this.icon.startsWith('fas ') ? this.icon : `fas ${this.icon}`
    }
  },

  methods: {
    handleClick(event) {
      if (!this.disabled && !this.loading) {
        this.$emit('click', event)
      }
    }
  },

  emits: ['click']
}
</script>

<style scoped>
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.3);
}

.button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* Variantes */
.button--primary {
  background: var(--primary-color);
  color: white;
}

.button--primary:hover:not(:disabled) {
  background: #7c3aed;
  transform: translateY(-1px);
}

.button--secondary {
  background: var(--secondary-color);
  color: white;
}

.button--secondary:hover:not(:disabled) {
  background: #ea580c;
  transform: translateY(-1px);
}

.button--success {
  background: var(--success-color);
  color: white;
}

.button--success:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
}

.button--danger {
  background: var(--error-color);
  color: white;
}

.button--danger:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-1px);
}

.button--warning {
  background: var(--warning-color);
  color: white;
}

.button--warning:hover:not(:disabled) {
  background: #d97706;
  transform: translateY(-1px);
}

.button--info {
  background: var(--info-color);
  color: white;
}

.button--info:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.button--ghost {
  background: transparent;
  color: var(--text-primary);
}

.button--ghost:hover:not(:disabled) {
  background: var(--bg-tertiary);
}

.button--outline {
  background: transparent;
  border: 2px solid var(--primary-color);
  color: var(--primary-color);
}

.button--outline:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
}

/* Tamanhos */
.button--small {
  padding: 8px 16px;
  font-size: 0.875rem;
  min-height: 36px;
}

.button--medium {
  padding: 12px 20px;
  font-size: 1rem;
  min-height: 44px;
}

.button--large {
  padding: 16px 24px;
  font-size: 1.125rem;
  min-height: 52px;
}

/* Estados */
.button--loading {
  cursor: wait;
}

.button--full-width {
  width: 100%;
}

.button--icon-only {
  padding: 12px;
  min-width: 44px;
}

.button--icon-only.button--small {
  padding: 8px;
  min-width: 36px;
}

.button--icon-only.button--large {
  padding: 16px;
  min-width: 52px;
}

.button__loading {
  animation: spin 1s linear infinite;
}

.button__text {
  white-space: nowrap;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsividade */
@media (max-width: 768px) {
  .button--medium {
    padding: 10px 16px;
    font-size: 0.875rem;
    min-height: 40px;
  }
  
  .button--large {
    padding: 14px 20px;
    font-size: 1rem;
    min-height: 48px;
  }
}

/* Tema escuro */
[data-theme="dark"] .button--ghost:hover:not(:disabled) {
  background: var(--bg-tertiary);
}
</style> 