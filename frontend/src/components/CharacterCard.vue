<template>
  <div class="character-card">
    <div class="avatar" :style="{ backgroundColor: character.color }">
      <img v-if="character.avatar_url || character.image" :src="getCharacterAvatarUrl(character.avatar_url)"  :alt="character.name" />
      <span v-else>{{ character.name.charAt(0) }}</span>
    </div>
    <div class="info">
      <h3>{{ character.name }}</h3>
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script>
import { getCharacterAvatarUrl } from '@/utils/backendConfig'
export default {
  name: 'CharacterCard',
  props: {
    character: {
      type: Object,
      required: true
    }
  },
  methods: {

    getCharacterAvatarUrl
  }
}
</script>

<style scoped>
.character-card {
  display: flex;
  align-items: center;
  background: var(--background-secondary, #fff);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 16px;
  margin-bottom: 16px;
  transition: box-shadow 0.2s;
}
.character-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}
.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-right: 20px;
  font-size: 2rem;
  color: #fff;
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.info {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
h3 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--text-primary);
}
</style>
