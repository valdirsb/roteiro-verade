<template>
  <div class="characters-page">
    <div class="characters-container">
      <div class="header-bar">
        <h1>Personagens</h1>
        <BaseButton @click="openCreateCharacterModal" variant="primary">
          <i class="fas fa-plus"></i> Novo Personagem
        </BaseButton>
      </div>
      <div class="search-bar">
        <input
          v-model="searchQuery"
          @keyup.enter="onSearch"
          type="text"
          placeholder="Buscar personagem..."
        />
        <BaseButton @click="onSearch">Buscar</BaseButton>
      </div>
      <div v-if="isLoading">Carregando personagens...</div>
      <div v-else-if="error" class="error">Erro ao carregar personagens.</div>
      <div v-else>
        <CharacterCard
          v-for="character in characters.data.characters"
          :key="character.id"
          :character="character"
        />
        <div v-if="!characters.data.characters.length">Nenhum personagem encontrado.</div>
        <div class="pagination-bar" v-if="characters.data.pagination">
          <BaseButton :disabled="!hasPrevPage" @click="goToPrevPage">Anterior</BaseButton>
          <span>Página {{ currentPage }} de {{ totalPages }}</span>
          <BaseButton :disabled="!hasNextPage" @click="goToNextPage">Próxima</BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import CharacterCard from '@/components/CharacterCard.vue';
import BaseButton from '@/components/ui/BaseButton.vue';

export default {
  name: 'CharactersPage',
  components: { CharacterCard, BaseButton },
  data() {
    return {
      searchQuery: ''
    }
  },
  computed: {
    ...mapGetters('characters', ['characters', 'isLoading', 'error']),
    currentPage() {
      return this.characters.data.pagination?.page || 1;
    },
    totalPages() {
      return this.characters.data.pagination
        ? Math.ceil(this.characters.data.pagination.total / this.characters.data.pagination.limit)
        : 1;
    },
    hasPrevPage() {
      return this.currentPage > 1;
    },
    hasNextPage() {
      return this.currentPage < this.totalPages;
    }
  },
  created() {
    this.loadCharacters();
  },
  methods: {
    ...mapActions('characters', ['loadCharacters', 'searchCharacters']),
    ...mapActions('ui', ['openModal']),
    onSearch() {
      this.searchCharacters(this.searchQuery);
    },
    goToPrevPage() {
      if (this.hasPrevPage) {
        const newPage = this.currentPage - 1;
        this.loadCharacters({ search: this.searchQuery, page: newPage });
      }
    },
    goToNextPage() {
      if (this.hasNextPage) {
        const newPage = this.currentPage + 1;
        this.loadCharacters({ search: this.searchQuery, page: newPage });
      }
    },
    openCreateCharacterModal() {
      this.openModal('createCharacter');
    }
  }
}
</script>

<style scoped>
.characters-page {
  padding: 20px;
}

.characters-container {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 20px;
  color: var(--text-primary);
}

p {
  color: var(--text-secondary);
}
.search-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}
.pagination-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}
.error {
  color: var(--error, #e53e3e);
  margin: 16px 0;
}
.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
</style>