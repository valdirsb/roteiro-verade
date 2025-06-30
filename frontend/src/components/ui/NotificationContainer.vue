<template>
  <div class="notification-container">
    <TransitionGroup 
      name="notification" 
      tag="div" 
      class="notifications-wrapper"
    >
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification"
        :class="[
          `notification--${notification.type}`,
          { 'notification--closable': notification.closable !== false }
        ]"
        @click="removeNotification(notification.id)"
      >
        <div class="notification__icon">
          <i :class="getIconClass(notification.icon, notification.type)"></i>
        </div>
        
        <div class="notification__content">
          <div class="notification__message">
            {{ notification.message }}
          </div>
          
          <div v-if="notification.details" class="notification__details">
            {{ notification.details }}
          </div>
        </div>
        
        <button 
          v-if="notification.closable !== false"
          class="notification__close"
          @click.stop="removeNotification(notification.id)"
          aria-label="Fechar notificação"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'NotificationContainer',
  
  computed: {
    ...mapGetters({
      notifications: 'ui/notifications'
    })
  },

  methods: {
    ...mapActions({
      removeNotification: 'ui/removeNotification'
    }),

    getIconClass(icon, type) {
      if (icon) {
        return icon.startsWith('fas ') ? icon : `fas ${icon}`
      }
      
      // Ícones padrão por tipo
      const defaultIcons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
      }
      
      return defaultIcons[type] || 'fas fa-bell'
    }
  }
}
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  pointer-events: none;
}

.notifications-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
}

.notification {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  background: var(--bg-primary);
  border-left: 4px solid;
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 300px;
  max-width: 400px;
}

.notification:hover {
  transform: translateX(-4px);
  box-shadow: var(--shadow-lg), 0 0 0 2px var(--border-color-hover);
}

.notification--success {
  border-left-color: var(--success-color);
  color: var(--success-color);
}

.notification--error {
  border-left-color: var(--error-color);
  color: var(--error-color);
}

.notification--warning {
  border-left-color: var(--warning-color);
  color: var(--warning-color);
}

.notification--info {
  border-left-color: var(--info-color);
  color: var(--info-color);
}

.notification__icon {
  flex-shrink: 0;
  font-size: 1.2rem;
  margin-top: 2px;
}

.notification__content {
  flex: 1;
  min-width: 0;
}

.notification__message {
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--text-primary);
}

.notification__details {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.notification__close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  margin-top: 2px;
}

.notification__close:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

/* Animações */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}

/* Responsividade */
@media (max-width: 768px) {
  .notification-container {
    top: 10px;
    right: 10px;
    left: 10px;
  }
  
  .notifications-wrapper {
    max-width: none;
  }
  
  .notification {
    min-width: auto;
    max-width: none;
  }
}

/* Tema escuro */
[data-theme="dark"] .notification {
  background: var(--bg-secondary);
  border-color: var(--border-color);
}

[data-theme="dark"] .notification:hover {
  background: var(--bg-tertiary);
}
</style> 