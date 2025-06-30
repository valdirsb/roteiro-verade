import { apiGet } from './api.js';

class StatsService {
  /**
   * Obter estatísticas globais do sistema
   * @returns {Promise<Object>} Estatísticas globais
   */
  async getGlobalStats() {
    return await apiGet('/stats');
  }

  /**
   * Obter estatísticas específicas de roteiros
   * @returns {Promise<Object>} Estatísticas de roteiros
   */
  async getScriptStats() {
    return await apiGet('/stats/scripts');
  }

  /**
   * Obter estatísticas de personagens
   * @returns {Promise<Object>} Estatísticas de personagens
   */
  async getCharacterStats() {
    return await apiGet('/stats/characters');
  }

  /**
   * Obter estatísticas de compartilhamentos
   * @returns {Promise<Object>} Estatísticas de compartilhamentos
   */
  async getShareStats() {
    return await apiGet('/stats/shares');
  }

  /**
   * Obter roteiros recentes
   * @param {number} limit - Número de roteiros a retornar (padrão: 5)
   * @returns {Promise<Object>} Roteiros recentes
   */
  async getRecentScripts(limit = 5) {
    return await apiGet(`/scripts/recent?limit=${limit}`);
  }

  /**
   * Obter dashboard completo com todas as estatísticas
   * @returns {Promise<Object>} Dados completos do dashboard
   */
  async getDashboardData() {
    try {
      const [globalStats, recentScripts] = await Promise.all([
        this.getGlobalStats(),
        this.getRecentScripts(5)
      ]);

      return {
        success: true,
        data: {
          stats: globalStats.success ? globalStats.data : null,
          recentScripts: recentScripts.success ? recentScripts.data.scripts : []
        }
      };
    } catch (error) {
      console.error('Erro ao obter dados do dashboard:', error);
      return {
        success: false,
        error: {
          type: 'api_error',
          message: 'Erro ao carregar dados do dashboard'
        }
      };
    }
  }

  /**
   * Obter estatísticas detalhadas por categoria
   * @param {string} category - Categoria (scripts, characters, shares)
   * @returns {Promise<Object>} Estatísticas da categoria
   */
  async getDetailedStats(category) {
    const endpoints = {
      scripts: '/stats/scripts',
      characters: '/stats/characters',
      shares: '/stats/shares'
    };

    const endpoint = endpoints[category];
    if (!endpoint) {
      throw new Error(`Categoria inválida: ${category}`);
    }

    return await apiGet(endpoint);
  }

  /**
   * Obter estatísticas de atividade (últimos 30 dias)
   * @returns {Promise<Object>} Estatísticas de atividade
   */
  async getActivityStats() {
    const response = await this.getScriptStats();
    
    if (response.success) {
      return {
        success: true,
        data: {
          activity: response.data.activity,
          recentActivity: response.data.recentActivity
        }
      };
    }

    return response;
  }

  /**
   * Obter estatísticas de uso de personagens
   * @returns {Promise<Object>} Estatísticas de uso de personagens
   */
  async getCharacterUsageStats() {
    const response = await this.getCharacterStats();
    
    if (response.success) {
      return {
        success: true,
        data: {
          topUsed: response.data.topUsed,
          total: response.data.total,
          custom: response.data.custom,
          default: response.data.default
        }
      };
    }

    return response;
  }

  /**
   * Obter estatísticas de compartilhamento
   * @returns {Promise<Object>} Estatísticas de compartilhamento
   */
  async getSharingStats() {
    const response = await this.getShareStats();
    
    if (response.success) {
      return {
        success: true,
        data: {
          total: response.data.total,
          byPermission: response.data.byPermission,
          topSharedScripts: response.data.topSharedScripts,
          byPeriod: response.data.byPeriod
        }
      };
    }

    return response;
  }
}

export default new StatsService(); 