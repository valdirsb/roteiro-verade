import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from './api.js';

class ScriptService {
  // Listar todos os roteiros
  async getScripts(filters = {}) {
    const queryParams = new URLSearchParams();

    if (filters.search) {
      queryParams.append('search', filters.search);
    }

    if (filters.status) {
      queryParams.append('status', filters.status);
    }

    if (filters.limit) {
      queryParams.append('limit', filters.limit);
    }

    if (filters.page) {
      queryParams.append('page', filters.page);
    }

    if (filters.sort_by) {
      queryParams.append('sort_by', filters.sort_by);
    }

    if (filters.sort_order) {
      queryParams.append('sort_order', filters.sort_order);
    }

    if (filters.is_public) {
      queryParams.append('is_public', filters.is_public);
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/scripts/user/scripts?${queryString}` : '/scripts/user/scripts';

    return await apiGet(url);
  }

  // Obter roteiro por ID
  async getScript(id) {
    return await apiGet(`/scripts/${id}`);
  }

  // Criar novo roteiro
  async createScript(scriptData) {
    return await apiPost('/scripts', scriptData);
  }

  // Atualizar roteiro
  async updateScript(id, scriptData) {
    return await apiPut(`/scripts/${id}`, scriptData);
  }

  // Excluir roteiro
  async deleteScript(id) {
    return await apiDelete(`/scripts/${id}`);
  }

  // Duplicar roteiro
  async duplicateScript(id) {
    return await apiPost(`/scripts/${id}/duplicate`);
  }

  // Exportar roteiro
  async exportScript(id, format = 'json') {
    const response = await apiGet(`/scripts/${id}/export?format=${format}`);

    if (response.success) {
      // Criar download do arquivo
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json'
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `roteiro_${id}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }

    return response;
  }

  // Importar roteiro
  async importScript(file) {
    const formData = new FormData();
    formData.append('file', file);

    return await apiPost('/scripts/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  // MENSAGENS DO ROTEIRO

  // Obter mensagens do roteiro
  async getScriptMessages(scriptId) {
    return await apiGet(`/scripts/${scriptId}/messages`);
  }

  // Adicionar mensagem ao roteiro
  async addMessage(scriptId, messageData) {
    return await apiPost(`/scripts/${scriptId}/messages`, messageData);
  }

  // Atualizar mensagem
  async updateMessage(scriptId, messageId, messageData) {
    return await apiPut(`/scripts/${scriptId}/messages/${messageId}`, messageData);
  }

  // Excluir mensagem
  async deleteMessage(scriptId, messageId) {
    return await apiDelete(`/scripts/${scriptId}/messages/${messageId}`);
  }

  // Reordenar mensagens
  async reorderMessages(scriptId, messageIds) {
    return await apiPatch(`/scripts/${scriptId}/messages/reorder`, {
      message_ids: messageIds
    });
  }

  // Mover mensagem para posição específica
  async moveMessage(scriptId, messageId, newPosition) {
    return await apiPatch(`/scripts/${scriptId}/messages/${messageId}/move`, {
      position: newPosition
    });
  }

  // Duplicar mensagem
  async duplicateMessage(scriptId, messageId) {
    return await apiPost(`/scripts/${scriptId}/messages/${messageId}/duplicate`);
  }

  // COMPARTILHAMENTO

  // Listar compartilhamentos do roteiro
  async getScriptShares(scriptId) {
    return await apiGet(`/scripts/${scriptId}/shares`);
  }

  // Compartilhar roteiro
  async shareScript(scriptId, shareData) {
    return await apiPost(`/scripts/${scriptId}/shares`, shareData);
  }

  // Atualizar permissões de compartilhamento
  async updateShare(scriptId, shareId, shareData) {
    return await apiPut(`/scripts/${scriptId}/shares/${shareId}`, shareData);
  }

  // Remover compartilhamento
  async removeShare(scriptId, shareId) {
    return await apiDelete(`/scripts/${scriptId}/shares/${shareId}`);
  }

  // Obter roteiros compartilhados comigo
  async getSharedScripts() {
    return await apiGet('/scripts/shared');
  }

  // Obter roteiros que compartilhei
  async getMySharedScripts() {
    return await apiGet('/scripts/my-shares');
  }

  // ESTATÍSTICAS E RELATÓRIOS

  // Obter estatísticas dos roteiros
  async getScriptStats() {
    return await apiGet('/scripts/stats');
  }

  // Obter relatório de atividade
  async getActivityReport(filters = {}) {
    const queryParams = new URLSearchParams();

    if (filters.start_date) {
      queryParams.append('start_date', filters.start_date);
    }

    if (filters.end_date) {
      queryParams.append('end_date', filters.end_date);
    }

    if (filters.user_id) {
      queryParams.append('user_id', filters.user_id);
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/scripts/report?${queryString}` : '/scripts/report';

    return await apiGet(url);
  }

  // VALIDAÇÕES E UTILITÁRIOS

  // Verificar se roteiro existe
  async scriptExists(title, excludeId = null) {
    const response = await this.getScripts({ search: title });

    if (response.success) {
      return response.data.some(script =>
        script.title.toLowerCase() === title.toLowerCase() &&
        script.id !== excludeId
      );
    }

    return false;
  }

  // Obter roteiro por título
  async getScriptByTitle(title) {
    const response = await this.getScripts({ search: title });

    if (response.success) {
      return response.data.find(script =>
        script.title.toLowerCase() === title.toLowerCase()
      );
    }

    return null;
  }

  // Buscar roteiros
  async searchScripts(query, filters = {}) {
    const searchFilters = {
      ...filters,
      search: query
    };

    return await this.getScripts(searchFilters);
  }

  // Obter roteiros por status
  async getScriptsByStatus(status) {
    return await this.getScripts({ status });
  }

  // Obter roteiros recentes
  async getRecentScripts(limit = 10) {
    return await this.getScripts({
      limit,
      sort_by: 'updated_at',
      sort_order: 'desc'
    });
  }

  // Obter roteiros populares
  async getPopularScripts(limit = 10) {
    return await this.getScripts({
      limit,
      sort_by: 'message_count',
      sort_order: 'desc'
    });
  }

  // BACKUP E RESTAURAÇÃO

  // Fazer backup de todos os roteiros
  async backupAllScripts() {
    const response = await apiGet('/scripts/backup');

    if (response.success) {
      // Criar download do arquivo
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json'
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_roteiros_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }

    return response;
  }

  // Restaurar roteiros do backup
  async restoreFromBackup(file) {
    const formData = new FormData();
    formData.append('file', file);

    return await apiPost('/scripts/restore', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
}

export default new ScriptService();