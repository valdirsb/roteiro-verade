<template>
  <div class="scripts-page">
    <div class="scripts-container">
      <div class="scripts-header">
        <h1>Roteiros</h1>
        <button class="new-script-btn" @click="createScript">Novo Roteiro</button>
      </div>

      <!-- Abas de navegação -->
      <div class="scripts-tabs">
        <button
          @click="changeTab('user')"
          :class="['tab-button', { active: activeTab === 'user' }]"
        >
          Meus Roteiros
        </button>
        <button
          @click="changeTab('public')"
          :class="['tab-button', { active: activeTab === 'public' }]"
        >
          Roteiros Públicos
        </button>
      </div>

      <div class="scripts-filters">
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por título..."
          class="search-input"
        />
        <select v-model="statusFilter" class="status-select" v-if="activeTab === 'user'">
          <option value=null>Todos os Status</option>
          <option value=true>Público</option>
          <option value=false>Privado</option>
        </select>
      </div>

      <table class="scripts-table">
        <thead>
          <tr>
            <th @click="changeSort('title')" :class="sortClass('title')">Título</th>
            <th @click="changeSort('creator_name')" :class="sortClass('creator_name')">Autor</th>
            <th @click="changeSort('created_at')" :class="sortClass('created_at')">Data de Criação</th>
            <th>Status</th>
            <th @click="changeSort('message_count')" :class="sortClass('message_count')">Mensagens</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6">Carregando...</td>
          </tr>
          <tr v-else-if="scripts.length === 0">
            <td colspan="6">Nenhum roteiro encontrado.</td>
          </tr>
          <tr v-else v-for="script in scripts" :key="script.id">
            <td>{{ script.title }}</td>
            <td>{{ script.creator_name || '-' }}</td>
            <td>{{ script.created_at ? (new Date(script.created_at)).toLocaleDateString() : '-' }}</td>
            <td>
              <span :title="script.is_public ? 'Público' : 'Privado'">
                <i :class="script.is_public ? 'fas fa-lock-open status-public' : 'fas fa-lock status-private'"></i>
                {{ script.is_public ? 'Público' : 'Privado' }}
              </span>
            </td>
            <td>{{ script.message_count }}</td>
            <td class="actions-cell">
              <BaseButton icon="fa-eye" variant="ghost" size="small" title="Visualizar" @click="openViewScriptModal(script.id)" />
              <BaseButton
                v-if="activeTab === 'user'"
                icon="fa-edit"
                variant="ghost"
                size="small"
                title="Editar"
                @click="viewScript(script.id)"
              />
              <BaseButton
                v-if="activeTab === 'user'"
                icon="fa-trash"
                variant="ghost"
                size="small"
                title="Excluir"
              />
              <BaseButton
                v-if="activeTab === 'user'"
                icon="fa-share-alt"
                variant="ghost"
                size="small"
                title="Compartilhar"
              />
            </td>
          </tr>
        </tbody>
      </table>
      <div class="pagination-container" v-if="pagination.pages > 1">
        <button :disabled="pagination.page === 1 || loading" @click="goToPage(pagination.page - 1)">Anterior</button>
        <span>Página {{ pagination.page }} de {{ pagination.pages }}</span>
        <button :disabled="pagination.page === pagination.pages || loading" @click="goToPage(pagination.page + 1)">Próxima</button>
      </div>
    </div>
  </div>
</template>

<script>
import BaseButton from '@/components/ui/BaseButton.vue'
import scriptService from '@/services/scriptService.js'
import { mapActions } from 'vuex'

export default {
  name: 'ScriptsPage',
  components: {
    BaseButton
  },
  data() {
    return {
      activeTab: 'user', // 'user' ou 'public'
      search: '',
      statusFilter: null,
      scripts: [],
      loading: false,
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 1
      },
      sortBy: 'created_at',
      sortOrder: 'desc',
    }
  },
  watch: {
    search() {
      this.pagination.page = 1;
      this.fetchScripts();
    },
    statusFilter() {
      this.pagination.page = 1;
      this.fetchScripts();
    },
    activeTab() {
      this.pagination.page = 1;
      this.search = '';
      this.statusFilter = null;
      this.fetchScripts();
    }
  },
  created() {
    this.fetchScripts();
  },
  methods: {
    ...mapActions({
      openModal: 'ui/openModal',
      notify: 'notify',
      closeModal: 'ui/closeModal',
      showError: 'ui/showError'
    }),

    createScript() {
      this.openModal('createScript')
    },

    viewScript(scriptId) {
      if (!scriptId) {
        console.error('ID do script não fornecido')
        return
      }
      this.$router.push(`/scripts/${scriptId}`)
    },

    changeTab(tab) {
      this.activeTab = tab;
    },
    async fetchScripts() {
      this.loading = true;
      const params = {
        type: this.activeTab,
        search: this.search,
        page: this.pagination.page,
        limit: this.pagination.limit,
        sort_by: this.sortBy,
        sort_order: this.sortOrder
      };

      // Apenas aplicar filtro de status para roteiros do usuário
      if (this.activeTab === 'user' && this.statusFilter !== "null" && this.statusFilter !== null ) {
        params.is_public = this.statusFilter
      }

      try {
        const response = await scriptService.getScripts(params);
        if (response.success) {
          this.scripts = response.data.data.scripts;
          this.pagination = {
            ...this.pagination,
            total: response.data.data.pagination.total,
            pages: response.data.data.pagination.pages,
            limit: response.data.data.pagination.limit
          };
        } else {
          this.scripts = [];
          this.notify({ type: 'error', message: response.message || 'Erro ao buscar roteiros.' });
        }
      } catch {
        this.scripts = [];
        this.notify({ type: 'error', message: 'Erro ao buscar roteiros.' });
      } finally {
        this.loading = false;
      }
    },
    goToPage(page) {
      if (page >= 1 && page <= this.pagination.pages && page !== this.pagination.page) {
        this.pagination.page = page;
        this.fetchScripts();
      }
    },
    changeSort(field) {
      if (this.sortBy === field) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortBy = field;
        this.sortOrder = 'asc';
      }
      this.fetchScripts();
    },
    sortClass(field) {
      return {
        sortable: true,
        sorted: this.sortBy === field,
        asc: this.sortBy === field && this.sortOrder === 'asc',
        desc: this.sortBy === field && this.sortOrder === 'desc',
      };
    },
    async openViewScriptModal(scriptId) {
      if (!scriptId) return
      this.loading = true
      try {
        // Buscar roteiro completo
        const [scriptRes, messagesRes] = await Promise.all([
          scriptService.getScript(scriptId),
          scriptService.getScriptMessages(scriptId)
        ])
        if (scriptRes.success && messagesRes.success) {
          this.$store.commit('ui/SET_MODAL_DATA', {
            script: scriptRes.data.data.script,
            messages: messagesRes.data.data.messages
          })
          this.$store.commit('ui/OPEN_MODAL', 'viewScript')
        } else {
          this.showError('Erro ao carregar roteiro para visualização.')
        }
      } catch {
        this.showError('Erro ao carregar roteiro para visualização.')
      } finally {
        this.loading = false
      }
    },
  }
}
</script>

<style scoped>
.scripts-page {
  padding: 20px;
}

.scripts-container {
  max-width: 1200px;
  margin: 0 auto;
}

.scripts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.new-script-btn {
  background: var(--primary-color);
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.scripts-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.tab-button {
  background: none;
  border: none;
  padding: 12px 24px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.tab-button:hover {
  color: var(--text-primary);
  background: #f5f5f5;
}

.tab-button.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

[data-theme="dark"] .tab-button:hover {
  color: var(--text-primary);
  background: #334155;
}

.scripts-filters {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.status-select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.scripts-table {
  width: 100%;
  border-collapse: collapse;
}

.scripts-table th,
.scripts-table td {
  padding: 12px 8px;
  border-bottom: 1px solid #eee;
  text-align: left;
}

.scripts-table th {
  color: var(--text-primary);
  cursor: pointer;
  user-select: none;
}

.scripts-table th.sortable:hover {
  background: #ececec;
}

.scripts-table th.sorted.asc::after {
  content: ' \25B2';
  font-size: 0.8em;
}
.scripts-table th.sorted.desc::after {
  content: ' \25BC';
  font-size: 0.8em;
}

.scripts-table td {
  color: var(--text-secondary);
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.status-public {
  color: var(--success-color);
  margin-right: 4px;
}
.status-private {
  color: var(--error-color);
  margin-right: 4px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}
.pagination-container button {
  background: var(--primary-color);
  color: #fff;
  border: none;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}
.pagination-container button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
