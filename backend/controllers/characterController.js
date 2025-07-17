const Character = require('../models/Character');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs').promises;

class CharacterController {
  // Listar personagens (público - apenas ativos)
  static async listCharacters(req, res) {
    try {
      const { search, color, page, limit, includeInactive } = req.query;
      
      const filters = {
        search,
        color,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10
      };

      // Adicionar filtro is_active apenas se não incluir inativos
      if (includeInactive !== 'true') {
        filters.is_active = 1; // Usar 1 em vez de true para MySQL
      }

      const result = await Character.findWithFilters(filters);

      res.json({
        success: true,
        data: {
          characters: result.characters.map(char => char.toSimpleObject()),
          pagination: result.pagination
        }
      });
    } catch (error) {
      logger.error('Erro ao listar personagens:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Obter personagem por ID (público)
  static async getCharacter(req, res) {
    try {
      const { id } = req.params;
      
      const character = await Character.findById(parseInt(id));
      
      if (!character) {
        return res.status(404).json({
          success: false,
          error: 'Personagem não encontrado'
        });
      }

      res.json({
        success: true,
        data: {
          character: character.toResponseObject()
        }
      });
    } catch (error) {
      logger.error('Erro ao obter personagem:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Criar personagem (apenas admin)
  static async createCharacter(req, res) {
    try {
      const { name, color } = req.body;
      let avatar_url = null;
      if (req.file && req.file.filename) {
        avatar_url = `/uploads/characters/${req.file.filename}`;
      }
      
      const character = await Character.create({
        name,
        color,
        avatar_url,
        created_by: req.user.id
      });

      logger.info(`Personagem criado por ${req.user.username}: ${character.name}`);

      res.status(201).json({
        success: true,
        message: 'Personagem criado com sucesso',
        data: {
          character: character.toResponseObject()
        }
      });
    } catch (error) {
      logger.error('Erro ao criar personagem:', error);
      
      if (error.message === 'Nome de personagem já existe') {
        return res.status(409).json({
          success: false,
          error: 'Nome de personagem já existe'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Atualizar personagem (apenas admin)
  static async updateCharacter(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const character = await Character.findById(parseInt(id));
      
      if (!character) {
        return res.status(404).json({
          success: false,
          error: 'Personagem não encontrado'
        });
      }

      const updatedCharacter = await character.update(updateData);

      logger.info(`Personagem atualizado por ${req.user.username}: ${updatedCharacter.name}`);

      res.json({
        success: true,
        message: 'Personagem atualizado com sucesso',
        data: {
          character: updatedCharacter.toResponseObject()
        }
      });
    } catch (error) {
      logger.error('Erro ao atualizar personagem:', error);
      
      if (error.message === 'Nome de personagem já existe') {
        return res.status(409).json({
          success: false,
          error: 'Nome de personagem já existe'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Desativar personagem (apenas admin)
  static async deactivateCharacter(req, res) {
    try {
      const { id } = req.params;
      
      const character = await Character.findById(parseInt(id));
      
      if (!character) {
        return res.status(404).json({
          success: false,
          error: 'Personagem não encontrado'
        });
      }

      // Verificar se personagem está sendo usado
      const isUsed = await character.isUsedInScripts();
      if (isUsed) {
        return res.status(400).json({
          success: false,
          error: 'Não é possível desativar um personagem que está sendo usado em roteiros'
        });
      }

      await character.deactivate();

      logger.info(`Personagem desativado por ${req.user.username}: ${character.name}`);

      res.json({
        success: true,
        message: 'Personagem desativado com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao desativar personagem:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Ativar personagem (apenas admin)
  static async activateCharacter(req, res) {
    try {
      const { id } = req.params;
      
      const character = await Character.findById(parseInt(id));
      
      if (!character) {
        return res.status(404).json({
          success: false,
          error: 'Personagem não encontrado'
        });
      }

      await character.activate();

      logger.info(`Personagem ativado por ${req.user.username}: ${character.name}`);

      res.json({
        success: true,
        message: 'Personagem ativado com sucesso',
        data: {
          character: character.toResponseObject()
        }
      });
    } catch (error) {
      logger.error('Erro ao ativar personagem:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Upload de avatar
  static async uploadAvatar(req, res) {
    try {
      const { id } = req.params;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Nenhum arquivo enviado'
        });
      }

      const character = await Character.findById(parseInt(id));
      
      if (!character) {
        return res.status(404).json({
          success: false,
          error: 'Personagem não encontrado'
        });
      }

      // Remover avatar anterior se existir
      if (character.avatar_url && character.avatar_url.startsWith('/uploads/')) {
        const oldAvatarPath = path.join(process.env.UPLOAD_PATH || './uploads', character.avatar_url.replace('/uploads/', ''));
        try {
          await fs.unlink(oldAvatarPath);
        } catch (error) {
          logger.warn('Erro ao remover avatar anterior:', error);
        }
      }

      // Salvar novo avatar
      const avatarUrl = `/uploads/characters/${req.file.filename}`;
      
      const updatedCharacter = await character.update({
        avatar_url: avatarUrl
      });

      logger.info(`Avatar atualizado por ${req.user.username}: ${updatedCharacter.name}`);

      res.json({
        success: true,
        message: 'Avatar atualizado com sucesso',
        data: {
          character: updatedCharacter.toResponseObject()
        }
      });
    } catch (error) {
      logger.error('Erro ao fazer upload de avatar:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Obter estatísticas de personagem
  static async getCharacterStats(req, res) {
    try {
      const { id } = req.params;
      
      const character = await Character.findById(parseInt(id));
      
      if (!character) {
        return res.status(404).json({
          success: false,
          error: 'Personagem não encontrado'
        });
      }

      const stats = await character.getUsageStats();

      res.json({
        success: true,
        data: {
          character: character.toResponseObject(),
          stats
        }
      });
    } catch (error) {
      logger.error('Erro ao obter estatísticas do personagem:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Listar personagens populares
  static async getPopularCharacters(req, res) {
    try {
      const { limit } = req.query;
      const limitCount = parseInt(limit) || 10;
      
      const characters = await Character.findPopular(limitCount);

      res.json({
        success: true,
        data: {
          characters: characters.map(char => char.toSimpleObject())
        }
      });
    } catch (error) {
      logger.error('Erro ao obter personagens populares:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Listar personagens por roteiro
  static async getCharactersByScript(req, res) {
    try {
      const { scriptId } = req.params;
      
      const characters = await Character.findByScript(parseInt(scriptId));

      res.json({
        success: true,
        data: {
          characters: characters.map(char => char.toSimpleObject())
        }
      });
    } catch (error) {
      logger.error('Erro ao obter personagens por roteiro:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Listar todos os personagens (admin - incluindo inativos)
  static async listAllCharacters(req, res) {
    try {
      const { includeInactive = true } = req.query;
      
      const characters = await Character.findAll({
        includeInactive: includeInactive === 'true'
      });

      res.json({
        success: true,
        data: {
          characters: characters.map(char => char.toResponseObject())
        }
      });
    } catch (error) {
      logger.error('Erro ao listar todos os personagens:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Buscar personagens com filtros avançados (admin)
  static async searchCharacters(req, res) {
    try {
      const { 
        search, 
        color, 
        created_by, 
        is_active, 
        page, 
        limit 
      } = req.query;
      
      const filters = {
        search,
        color,
        created_by: created_by ? parseInt(created_by) : undefined,
        is_active: is_active === 'true' ? 1 : is_active === 'false' ? 0 : undefined,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10
      };

      const result = await Character.findWithFilters(filters);

      res.json({
        success: true,
        data: {
          characters: result.characters.map(char => char.toResponseObject()),
          pagination: result.pagination
        }
      });
    } catch (error) {
      logger.error('Erro ao buscar personagens:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Verificar se nome de personagem está disponível
  static async checkNameAvailability(req, res) {
    try {
      const { name } = req.params;
      
      const character = await Character.findByName(name);
      
      res.json({
        success: true,
        data: {
          available: !character,
          name: name
        }
      });
    } catch (error) {
      logger.error('Erro ao verificar disponibilidade do nome:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }
}

module.exports = CharacterController; 