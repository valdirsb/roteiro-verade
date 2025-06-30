<template>
  <div class="dashboard">
    <div class="dashboard__header">
      <h1 class="dashboard__title">Dashboard</h1>
      <p class="dashboard__subtitle">Bem-vindo ao Roteiro Verade</p>
      <p v-if="lastUpdated" class="dashboard__last-updated">
        Última atualização: {{ lastUpdated }}
      </p>
    </div>
    
    <!-- Indicador de loading -->
    <div v-if="isLoading" class="dashboard__loading">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Carregando dados do dashboard...</p>
    </div>

    <!-- Indicador de erro -->
    <div v-else-if="hasError" class="dashboard__error">
      <i class="fas fa-exclamation-triangle"></i>
      <p>{{ error?.message || 'Erro ao carregar dados do dashboard' }}</p>
      <BaseButton variant="outline" @click="loadDashboardData">
        Tentar Novamente
      </BaseButton>
    </div>
    
    <div class="dashboard__content">
      <div class="dashboard__stats">
        <div class="stat-card">
          <div class="stat-card__icon">
            <i class="fas fa-file-alt"></i>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ scriptsCount }}</div>
            <div class="stat-card__label">Roteiros</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-card__icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ charactersCount }}</div>
            <div class="stat-card__label">Personagens</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-card__icon">
            <i class="fas fa-share-alt"></i>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ sharesCount }}</div>
            <div class="stat-card__label">Compartilhamentos</div>
          </div>
        </div>
      </div>
      
      <div class="dashboard__actions">
        <BaseButton 
          variant="primary" 
          size="large"
          icon="fa-plus"
          @click="createScript"
        >
          Criar Novo Roteiro
        </BaseButton>
        
        <BaseButton 
          v-if="isAdmin"
          variant="secondary" 
          size="large"
          icon="fa-user-plus"
          @click="createCharacter"
        >
          Adicionar Personagem
        </BaseButton>
      </div>
      
      <div class="dashboard__recent">
        <h2 class="dashboard__section-title">Roteiros Recentes</h2>
        <div v-if="recentScripts.length === 0" class="dashboard__empty">
          <i class="fas fa-file-alt"></i>
          <p>Nenhum roteiro criado ainda</p>
          <BaseButton variant="outline" @click="createScript">
            Criar Primeiro Roteiro
          </BaseButton>
        </div>
        <div v-else class="dashboard__scripts">
          <div 
            v-for="script in recentScripts" 
            :key="script.id"
            class="script-card"
            @click="viewScript(script.id)"
          >
            <div class="script-card__header">
              <h3 class="script-card__title">{{ script.title }}</h3>
              <span class="script-card__status" :class="`script-card__status--${script.status || 'draft'}`">
                {{ getStatusLabel(script.status || 'draft') }}
              </span>
            </div>
            <p class="script-card__description">{{ script.description }}</p>
            <div class="script-card__meta">
              <span class="script-card__date">
                <i class="fas fa-calendar"></i>
                {{ formatDate(script.updatedAt || script.updated_at) }}
              </span>
              <span class="script-card__messages">
                <i class="fas fa-comments"></i>
                {{ script.messageCount || 0 }} mensagens
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import BaseButton from '@/components/ui/BaseButton.vue'

export default {
  name: 'DashboardView',
  
  components: {
    BaseButton
  },

  computed: {
    ...mapGetters({
      scriptsCount: 'stats/scriptsCount',
      charactersCount: 'stats/charactersCount',
      sharesCount: 'stats/sharesCount',
      recentScripts: 'stats/recentScripts',
      isAdmin: 'auth/isAdmin',
      isLoading: 'stats/isLoading',
      hasError: 'stats/hasError',
      error: 'stats/error',
      lastUpdated: 'stats/formattedLastUpdated'
    })
  },

  methods: {
    ...mapActions({
      openModal: 'ui/openModal',
      loadDashboardData: 'stats/loadDashboardData',
      loadAllStats: 'stats/loadAllStats'
    }),

    createScript() {
      this.openModal('createScript')
    },

    createCharacter() {
      this.openModal('createCharacter')
    },

    viewScript(scriptId) {
      if (!scriptId) {
        console.error('ID do script não fornecido')
        return
      }
      console.log('Navegando para o script:', scriptId)
      this.$router.push(`/scripts/${scriptId}`)
    },

    getStatusLabel(status) {
      const labels = {
        draft: 'Rascunho',
        in_progress: 'Em Progresso',
        completed: 'Concluído',
        archived: 'Arquivado'
      }
      return labels[status] || status
    },

    formatDate(date) {
      if (!date) return 'Data não disponível'
      return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    },

    async loadDashboardData() {
      try {
        console.log('Carregando dados do dashboard...')
        
        const result = await this.loadAllStats()
        
        if (result.success) {
          console.log('Dados do dashboard carregados com sucesso')
          
          console.log('Scripts count:', this.scriptsCount)
          console.log('Characters count:', this.charactersCount)
          console.log('Shares count:', this.sharesCount)
          console.log('Recent scripts:', this.recentScripts)
          console.log('Last updated:', this.lastUpdated)
        } else {
          console.error('Erro ao carregar dados do dashboard:', result.error)
        }
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error)
      }
    }
  },

  async mounted() {
    await this.loadDashboardData()
  }
}
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeIn 0.6s ease-out;
}

.dashboard__header {
  margin-bottom: 40px;
  text-align: center;
  padding: 32px 0;
  background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));
  border-radius: var(--border-radius-xl);
  border: 1px solid var(--border-color);
}

.dashboard__title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 12px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dashboard__subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 400;
}

.dashboard__last-updated {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 8px 0 0 0;
  font-style: italic;
}

.dashboard__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.stat-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
  animation: slideInUp 0.6s ease-out;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-color);
}

.stat-card__icon {
  width: 60px;
  height: 60px;
  border-radius: var(--border-radius-lg);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.stat-card__content {
  flex: 1;
}

.stat-card__value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: 4px;
}

.stat-card__label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dashboard__actions {
  display: flex;
  gap: 16px;
  margin-bottom: 40px;
  justify-content: center;
  flex-wrap: wrap;
}

.dashboard__recent {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-xl);
  padding: 32px;
  box-shadow: var(--shadow-sm);
}

.dashboard__section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.dashboard__section-title::before {
  content: '';
  width: 4px;
  height: 24px;
  background: linear-gradient(180deg, var(--primary-color), var(--secondary-color));
  border-radius: 2px;
}

.dashboard__empty {
  text-align: center;
  padding: 48px 24px;
  color: var(--text-secondary);
}

.dashboard__empty i {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

.dashboard__empty p {
  font-size: 1.125rem;
  margin-bottom: 24px;
}

.dashboard__scripts {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.script-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: 24px;
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
  animation: fadeInScale 0.6s ease-out;
}

.script-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--primary-color);
  transform: scaleX(0);
  transition: transform var(--transition-normal);
}

.script-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
}

.script-card:hover::before {
  transform: scaleX(1);
}

.script-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.script-card__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
  margin-right: 12px;
}

.script-card__status {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: var(--border-radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.script-card__status--draft {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.script-card__status--in_progress {
  background: var(--info-color);
  color: white;
}

.script-card__status--completed {
  background: var(--success-color);
  color: white;
}

.script-card__status--archived {
  background: var(--text-muted);
  color: white;
}

.script-card__description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.script-card__meta {
  display: flex;
  gap: 16px;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.script-card__date,
.script-card__messages {
  display: flex;
  align-items: center;
  gap: 4px;
}

.script-card__date i,
.script-card__messages i {
  font-size: 0.875rem;
}

/* Responsividade */
@media (max-width: 768px) {
  .dashboard__header {
    padding: 24px 16px;
    margin-bottom: 32px;
  }
  
  .dashboard__title {
    font-size: 2rem;
  }
  
  .dashboard__subtitle {
    font-size: 1.125rem;
  }
  
  .dashboard__stats {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 32px;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .stat-card__icon {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }
  
  .stat-card__value {
    font-size: 1.75rem;
  }
  
  .dashboard__actions {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    margin-bottom: 32px;
  }
  
  .dashboard__recent {
    padding: 24px 16px;
  }
  
  .dashboard__scripts {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .script-card {
    padding: 20px;
  }
  
  .script-card__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .script-card__meta {
    flex-direction: column;
    gap: 8px;
  }
}

/* Animações */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.script-card:nth-child(1) { animation-delay: 0.1s; }
.script-card:nth-child(2) { animation-delay: 0.2s; }
.script-card:nth-child(3) { animation-delay: 0.3s; }
.script-card:nth-child(4) { animation-delay: 0.4s; }

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Tema escuro */
[data-theme="dark"] .dashboard__header {
  background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));
  border-color: var(--border-color);
}

[data-theme="dark"] .stat-card {
  background: var(--bg-primary);
  border-color: var(--border-color);
}

[data-theme="dark"] .script-card {
  background: var(--bg-secondary);
  border-color: var(--border-color);
}

.dashboard__loading,
.dashboard__error {
  text-align: center;
  padding: 60px 24px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-xl);
  margin-bottom: 40px;
}

.dashboard__loading i,
.dashboard__error i {
  font-size: 2rem;
  margin-bottom: 16px;
  display: block;
}

.dashboard__loading i {
  color: var(--primary-color);
}

.dashboard__error i {
  color: var(--error-color);
}

.dashboard__loading p,
.dashboard__error p {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.dashboard__error p {
  color: var(--error-color);
}
</style> 