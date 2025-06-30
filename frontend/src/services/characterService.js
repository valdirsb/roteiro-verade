import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from './api.js';

class CharacterService {
  // Listar todos os personagens
  async getCharacters() {
    return await apiGet('/characters');
  }

  // Obter personagem por ID
  async getCharacter(id) {
    return await apiGet(`/characters/${id}`);
  }

  // Criar novo personagem
  async createCharacter(characterData) {
    return await apiPost('/characters', characterData);
  }

  // Atualizar personagem
  async updateCharacter(id, characterData) {
    return await apiPut(`/characters/${id}`, characterData);
  }

  // Excluir personagem
  async deleteCharacter(id) {
    return await apiDelete(`/characters/${id}`);
  }

  // Upload de avatar
  async uploadAvatar(id, file) {
    return await apiUpload(`/characters/${id}/avatar`, file);
  }

  // Obter personagens padrão (Liry, Zad, Kim, Camila)
  getDefaultCharacters() {
    return [
      {
        id: 'liry',
        name: 'Liry',
        color: '#8B5CF6',
        avatar: '/liry.png',
        is_default: true
      },
      {
        id: 'zad',
        name: 'Zad',
        color: '#F97316',
        avatar: '/zad.png',
        is_default: true
      },
      {
        id: 'kim',
        name: 'Kim',
        color: '#10B981',
        avatar: '/kim.png',
        is_default: true
      },
      {
        id: 'camila',
        name: 'Camila',
        color: '#EF4444',
        avatar: '/camila.png',
        is_default: true
      },
      {
        id: 'action',
        name: 'Texto de Ação',
        color: '#6B7280',
        avatar: null,
        is_default: true
      }
    ];
  }

  // Obter personagem por nome
  async getCharacterByName(name) {
    const response = await this.getCharacters();
    
    if (response.success) {
      return response.data.find(char => 
        char.name.toLowerCase() === name.toLowerCase()
      );
    }
    
    return null;
  }

  // Verificar se personagem existe
  async characterExists(name, excludeId = null) {
    const response = await this.getCharacters();
    
    if (response.success) {
      return response.data.some(char => 
        char.name.toLowerCase() === name.toLowerCase() && 
        char.id !== excludeId
      );
    }
    
    return false;
  }

  // Obter personagens com filtros
  async getCharactersWithFilters(filters = {}) {
    const queryParams = new URLSearchParams();
    
    if (filters.search) {
      queryParams.append('search', filters.search);
    }
    
    if (filters.is_default !== undefined) {
      queryParams.append('is_default', filters.is_default);
    }
    
    if (filters.limit) {
      queryParams.append('limit', filters.limit);
    }
    
    if (filters.offset) {
      queryParams.append('offset', filters.offset);
    }
    
    const queryString = queryParams.toString();
    const url = queryString ? `/characters?${queryString}` : '/characters';
    
    return await apiGet(url);
  }

  // Obter estatísticas dos personagens
  async getCharacterStats() {
    return await apiGet('/characters/stats');
  }

  // Duplicar personagem
  async duplicateCharacter(id) {
    const characterResponse = await this.getCharacter(id);
    
    if (!characterResponse.success) {
      return characterResponse;
    }
    
    const character = characterResponse.data;
    const newName = `${character.name} (Cópia)`;
    
    // Verificar se o nome já existe
    let finalName = newName;
    let counter = 1;
    
    while (await this.characterExists(finalName)) {
      finalName = `${newName} ${counter}`;
      counter++;
    }
    
    // Criar novo personagem com dados copiados
    const newCharacterData = {
      name: finalName,
      color: character.color,
      description: character.description
    };
    
    return await this.createCharacter(newCharacterData);
  }

  // Exportar personagens
  async exportCharacters(format = 'json') {
    const response = await apiGet(`/characters/export?format=${format}`);
    
    if (response.success) {
      // Criar download do arquivo
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json'
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `personagens_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
    
    return response;
  }

  // Importar personagens
  async importCharacters(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    return await apiPost('/characters/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
}

export default new CharacterService(); 