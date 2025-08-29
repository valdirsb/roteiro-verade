<template>
  <div class="character-card">
    <div class="avatar-wrapper">
      <div class="avatar" :style="{ backgroundColor: character.color }">
        <img v-if="character.avatar_url || character.image" :src="getCharacterAvatarUrl(character.avatar_url)" :alt="character.name" />
        <span v-else>{{ character.name.charAt(0) }}</span>
      </div>
    </div>
    <div class="name">{{ character.name }}</div>
    <div class="actions">
      <button class="icon-btn edit" @click="editCharacter" title="Editar">
        <i class="fas fa-edit"></i>
      </button>
      <button class="icon-btn delete" @click="confirmDelete" title="Excluir">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { getCharacterAvatarUrl } from '@/utils/backendConfig'
import { mapActions, mapMutations } from 'vuex'
export default {
  name: 'CharacterCard',
  props: {
    character: {
      type: Object,
      required: true
    }
  },
  methods: {
    getCharacterAvatarUrl,
    ...mapActions('ui', ['openModal']),
    ...mapMutations('ui', ['SET_MODAL_DATA']),
    editCharacter() {
      this.SET_MODAL_DATA({ character: this.character })
      this.openModal('createCharacter')
    },
    confirmDelete() {
      this.SET_MODAL_DATA({ character: this.character })
      this.openModal('confirmDelete')
    }
  }
}
</script>

<style scoped>
.character-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--background-secondary, #fff);
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  padding: 28px 18px 16px 18px;
  margin: 0;
  transition: box-shadow 0.2s, transform 0.2s, background 0.2s, border 0.2s;
  border: 2px solid transparent;
  position: relative;
  min-width: 180px;
  max-width: 220px;
}
.character-card:hover {
  box-shadow: 0 6px 24px rgba(0,0,0,0.13);
  border-color: var(--primary, #8B5CF6);
  transform: translateY(-2px) scale(1.02);
}
.avatar-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-bottom: 12px;
}
.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-size: 2.2rem;
  color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  border: 3px solid #fff8;
  background: inherit;
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.name {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text-primary, #222);
  text-align: center;
  margin-bottom: 18px;
  word-break: break-word;
}
.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  width: 100%;
  margin-top: auto;
}
.icon-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: var(--background-action, #f3f4f6);
  color: var(--icon-action, #6b7280);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.18s, color 0.18s, box-shadow 0.18s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  outline: none;
  position: relative;
}
.icon-btn.edit:hover {
  background: var(--primary-bg-hover, #e0e7ff);
  color: var(--primary, #2563eb);
}
.icon-btn.delete:hover {
  background: var(--error-bg-hover, #fee2e2);
  color: var(--error, #dc2626);
}
.icon-btn:active {
  transform: scale(0.96);
}

/* Tema escuro */
:root.dark .character-card,
[data-theme="dark"] .character-card {
  background: var(--background-secondary-dark, #23272f);
  box-shadow: 0 2px 12px rgba(0,0,0,0.25);
  border: 2px solid rgba(139,92,246,0.10);
}
:root.dark .character-card:hover,
[data-theme="dark"] .character-card:hover {
  border-color: var(--primary, #8B5CF6);
  box-shadow: 0 6px 24px rgba(0,0,0,0.32);
}
:root.dark .avatar,
[data-theme="dark"] .avatar {
  border: 3px solid #fff3;
  background: #23272f;
}
:root.dark .name,
[data-theme="dark"] .name {
  color: var(--text-primary-dark, #f3f4f6);
}
:root.dark .icon-btn,
[data-theme="dark"] .icon-btn {
  background: #2d323c;
  color: #bfc4d1;
}
:root.dark .icon-btn.edit:hover,
[data-theme="dark"] .icon-btn.edit:hover {
  background: #3730a3;
  color: #a5b4fc;
}
:root.dark .icon-btn.delete:hover,
[data-theme="dark"] .icon-btn.delete:hover {
  background: #7f1d1d;
  color: #fecaca;
}
@media (max-width: 600px) {
  .character-card {
    min-width: 100%;
    max-width: 100%;
    padding: 20px 8px 12px 8px;
  }
  .avatar {
    width: 56px;
    height: 56px;
    font-size: 1.5rem;
  }
}
</style>
