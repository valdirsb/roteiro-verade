<template>
  <div class="input-wrapper">
    <label v-if="label" :for="id" class="input__label">
      {{ label }}
      <span v-if="required" class="input__required">*</span>
    </label>
    
    <div class="input__container">
      <i v-if="icon" :class="iconClass" class="input__icon"></i>
      
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :min="min"
        :max="max"
        :step="step"
        :autocomplete="autocomplete"
        :class="inputClasses"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
      />
      
      <i v-if="loading" class="fas fa-spinner fa-spin input__loading"></i>
      <i v-else-if="clearable && modelValue" class="fas fa-times input__clear" @click="clearInput"></i>
    </div>
    
    <div v-if="error || hint" class="input__message">
      <span v-if="error" class="input__error">{{ error }}</span>
      <span v-else-if="hint" class="input__hint">{{ hint }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseInput',
  
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    type: {
      type: String,
      default: 'text',
      validator: value => ['text', 'email', 'password', 'number', 'tel', 'url', 'search', 'date', 'time', 'datetime-local'].includes(value)
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    id: {
      type: String,
      default() {
        return `input-${Math.random().toString(36).substr(2, 9)}`
      }
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ''
    },
    hint: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large'].includes(value)
    },
    min: {
      type: [String, Number],
      default: null
    },
    max: {
      type: [String, Number],
      default: null
    },
    step: {
      type: [String, Number],
      default: null
    },
    autocomplete: {
      type: String,
      default: ''
    }
  },

  computed: {
    inputClasses() {
      return [
        'input',
        `input--${this.size}`,
        {
          'input--error': this.error,
          'input--disabled': this.disabled,
          'input--loading': this.loading,
          'input--with-icon': this.icon,
          'input--with-clear': this.clearable && this.modelValue
        }
      ]
    },

    iconClass() {
      return this.icon.startsWith('fas ') ? this.icon : `fas ${this.icon}`
    }
  },

  methods: {
    handleInput(event) {
      this.$emit('update:modelValue', event.target.value)
      this.$emit('input', event.target.value)
    },

    handleFocus(event) {
      this.$emit('focus', event)
    },

    handleBlur(event) {
      this.$emit('blur', event)
    },

    handleKeydown(event) {
      this.$emit('keydown', event)
    },

    clearInput() {
      this.$emit('update:modelValue', '')
      this.$emit('input', '')
      this.$emit('clear')
    }
  },

  emits: ['update:modelValue', 'input', 'focus', 'blur', 'keydown', 'clear']
}
</script>

<style scoped>
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input__label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.input__required {
  color: var(--error-color);
  margin-left: 2px;
}

.input__container {
  position: relative;
  display: flex;
  align-items: center;
}

.input {
  width: 100%;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.2s ease;
  font-family: inherit;
}

.input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.input:disabled {
  background: var(--bg-tertiary);
  color: var(--text-muted);
  cursor: not-allowed;
}

.input--error {
  border-color: var(--error-color);
}

.input--error:focus {
  border-color: var(--error-color);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

/* Tamanhos */
.input--small {
  padding: 8px 12px;
  font-size: 0.875rem;
  min-height: 36px;
}

.input--medium {
  padding: 12px 16px;
  font-size: 1rem;
  min-height: 44px;
}

.input--large {
  padding: 16px 20px;
  font-size: 1.125rem;
  min-height: 52px;
}

/* Ícones */
.input--with-icon {
  padding-left: 44px;
}

.input__icon {
  position: absolute;
  left: 16px;
  color: var(--text-muted);
  font-size: 1rem;
  pointer-events: none;
}

.input--with-clear {
  padding-right: 44px;
}

.input__clear {
  position: absolute;
  right: 16px;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.input__clear:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.input__loading {
  position: absolute;
  right: 16px;
  color: var(--text-muted);
  font-size: 1rem;
}

/* Mensagens */
.input__message {
  font-size: 0.875rem;
  min-height: 1.25rem;
}

.input__error {
  color: var(--error-color);
}

.input__hint {
  color: var(--text-secondary);
}

/* Responsividade */
@media (max-width: 768px) {
  .input--medium {
    padding: 10px 14px;
    font-size: 0.875rem;
    min-height: 40px;
  }
  
  .input--large {
    padding: 14px 18px;
    font-size: 1rem;
    min-height: 48px;
  }
}

/* Tema escuro */
[data-theme="dark"] .input {
  background: var(--bg-secondary);
  border-color: var(--border-color);
}

[data-theme="dark"] .input:focus {
  background: var(--bg-primary);
}
</style> 