const Script = require('../models/Script');
const ScriptMessage = require('../models/ScriptMessage');
const logger = require('../utils/logger');

class ScriptController {
  // Listar roteiros (públicos e do usuário)
  static async listScripts(req, res) {
    try {
      const { 
        search, 
        is_public, 
        page, 
        limit, 
        sort_by, 
        sort_order,
        type = 'user' // all, public, user, shared
      } = req.query;
      const userId = req.user?.id;

      console.log("DEBUG - req", req.query )
      
      let result;
      
      switch (type) {
        case 'public':
          result = await Script.findPublic({
            search,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            sort_by,
            sort_order
          });
          break;
          
        case 'user':
          if (!userId) {
            return res.status(401).json({
              success: false,
              error: 'Usuário não autenticado'
            });
          }
          result = await Script.findByUser(userId, {
            search,
            is_public,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            sort_by,
            sort_order
          });
          break;
          
        case 'shared':
          if (!userId) {
            return res.status(401).json({
              success: false,
              error: 'Usuário não autenticado'
            });
          }
          result = await Script.findSharedWithUser(userId, {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            sort_by,
            sort_order
          });
          break;
          
        default: // all
          if (userId) {
            // Usuário logado: mostrar seus roteiros, públicos e compartilhados
            const [userScripts, publicScripts, sharedScripts] = await Promise.all([
              Script.findByUser(userId, { search, is_public, page: parseInt(page) || 1, limit: 5 }),
              Script.findPublic({ search, page: parseInt(page) || 1, limit: 5 }),
              Script.findSharedWithUser(userId, { page: parseInt(page) || 1, limit: 5 })
            ]);
            
            result = {
              scripts: [
                ...userScripts.scripts,
                ...publicScripts.scripts,
                ...sharedScripts.scripts
              ].slice(0, parseInt(limit) || 10),
              pagination: {
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10,
                total: userScripts.pagination.total + publicScripts.pagination.total + sharedScripts.pagination.total,
                pages: Math.ceil((userScripts.pagination.total + publicScripts.pagination.total + sharedScripts.pagination.total) / (parseInt(limit) || 10))
              }
            };
          } else {
            // Usuário não logado: apenas roteiros públicos
            result = await Script.findPublic({
              search,
              page: parseInt(page) || 1,
              limit: parseInt(limit) || 10,
              sort_by,
              sort_order
            });
          }
          break;
      }

      res.json({
        success: true,
        data: {
          scripts: result.scripts.map(script => script.toSimpleObject()),
          pagination: result.pagination
        }
      });
    } catch (error) {
      logger.error('Erro ao listar roteiros:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Obter roteiros recentes
  static async getRecentScripts(req, res) {
    try {
      const { limit = 5 } = req.query;
      const userId = req.user?.id;
      
      logger.info('Obtendo roteiros recentes', {
        service: 'roteiro-verade-backend',
        userId: userId,
        limit: parseInt(limit)
      });

      // Buscar roteiros recentes usando o método findAll do modelo
      const filters = {
        limit: parseInt(limit),
        sort_by: 'updated_at',
        sort_order: 'desc'
      };

      let formattedScripts = [];

      if (userId) {
        const [userScripts, publicScripts] = await Promise.all([
          Script.findAll({ ...filters, created_by: userId }),
          Script.findPublic(filters)
        ]);
        const allScripts = [
          ...userScripts.scripts,
          ...publicScripts.scripts
        ].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
         .slice(0, parseInt(limit));
        formattedScripts = allScripts.map(script => ({
          id: script.id,
          title: script.title,
          description: script.description,
          status: script.status || 'draft',
          updatedAt: script.updated_at,
          messageCount: script.message_count || 0
        }));
      } else {
        const publicScripts = await Script.findPublic(filters);
        formattedScripts = publicScripts.scripts.map(script => ({
          id: script.id,
          title: script.title,
          description: script.description,
          status: script.status || 'draft',
          updatedAt: script.updated_at,
          messageCount: script.message_count || 0
        }));
      }

      // Sempre retornar sucesso, mesmo se não houver roteiros
      if (!formattedScripts || formattedScripts.length === 0) {
        return res.json({
          success: true,
          data: {
            scripts: [],
            total: 0,
            limit: parseInt(limit)
          }
        });
      }

      res.json({
        success: true,
        data: {
          scripts: formattedScripts,
          total: formattedScripts.length,
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      logger.error('Erro ao obter roteiros recentes:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Obter roteiro por ID
  static async getScript(req, res) {
    try {
      const { id } = req.params;
      const { includeMessages = 'true', includeCharacters = 'true' } = req.query;
      const userId = req.user?.id;
      
      const script = await Script.findById(parseInt(id), {
        includeMessages: includeMessages === 'true',
        includeCharacters: includeCharacters === 'true'
      });
      
      if (!script) {
        return res.status(404).json({
          success: false,
          error: 'Roteiro não encontrado'
        });
      }

      // Verificar permissões
      if (userId) {
        const permissions = await script.checkUserPermission(userId);
        if (!permissions.can_view) {
          return res.status(403).json({
            success: false,
            error: 'Acesso negado'
          });
        }
        script.permissions = permissions;
      } else if (!script.is_public) {
        return res.status(403).json({
          success: false,
          error: 'Roteiro privado'
        });
      }

      res.json({
        success: true,
        data: {
          script: script.toResponseObject()
        }
      });
    } catch (error) {
      logger.error('Erro ao obter roteiro:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Criar roteiro
  static async createScript(req, res) {
    try {
      const { title, description, is_public } = req.body;
      
      const script = await Script.create({
        title,
        description,
        is_public,
        created_by: req.user.id
      });

      logger.info(`Roteiro criado por ${req.user.username}: ${script.title}`);

      res.status(201).json({
        success: true,
        message: 'Roteiro criado com sucesso',
        data: {
          script: script.toResponseObject()
        }
      });
    } catch (error) {
      logger.error('Erro ao criar roteiro:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Atualizar roteiro
  static async updateScript(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const script = await Script.findById(parseInt(id));
      
      if (!script) {
        return res.status(404).json({
          success: false,
          error: 'Roteiro não encontrado'
        });
      }

      // Verificar permissões
      const permissions = await script.checkUserPermission(req.user.id);
      if (!permissions.can_edit) {
        return res.status(403).json({
          success: false,
          error: 'Sem permissão para editar este roteiro'
        });
      }

      const updatedScript = await script.update(updateData);

      logger.info(`Roteiro atualizado por ${req.user.username}: ${updatedScript.title}`);

      res.json({
        success: true,
        message: 'Roteiro atualizado com sucesso',
        data: {
          script: updatedScript.toResponseObject()
        }
      });
    } catch (error) {
      logger.error('Erro ao atualizar roteiro:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Excluir roteiro
  static async deleteScript(req, res) {
    try {
      const { id } = req.params;
      
      const script = await Script.findById(parseInt(id));
      
      if (!script) {
        return res.status(404).json({
          success: false,
          error: 'Roteiro não encontrado'
        });
      }

      // Verificar permissões
      const permissions = await script.checkUserPermission(req.user.id);
      if (!permissions.can_delete) {
        return res.status(403).json({
          success: false,
          error: 'Sem permissão para excluir este roteiro'
        });
      }

      await script.delete();

      logger.info(`Roteiro excluído por ${req.user.username}: ${script.title}`);

      res.json({
        success: true,
        message: 'Roteiro excluído com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao excluir roteiro:', error);
      
      if (error.message.includes('possui mensagens')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Adicionar mensagem ao roteiro
  static async addMessage(req, res) {
    try {
      const { id } = req.params;
      const { character_id, message, order_index } = req.body;
      
      const script = await Script.findById(parseInt(id));
      
      if (!script) {
        return res.status(404).json({
          success: false,
          error: 'Roteiro não encontrado'
        });
      }

      // Verificar permissões
      const permissions = await script.checkUserPermission(req.user.id);
      if (!permissions.can_edit) {
        return res.status(403).json({
          success: false,
          error: 'Sem permissão para editar este roteiro'
        });
      }

      const newMessage = await ScriptMessage.create({
        script_id: parseInt(id),
        character_id,
        message,
        order_index
      });

      logger.info(`Mensagem adicionada ao roteiro ${id} por ${req.user.username}`);

      res.status(201).json({
        success: true,
        message: 'Mensagem adicionada com sucesso',
        data: {
          message: newMessage.toResponseObject()
        }
      });
    } catch (error) {
      logger.error('Erro ao adicionar mensagem:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Atualizar mensagem
  static async updateMessage(req, res) {
    try {
      const { id, messageId } = req.params;
      const updateData = req.body;
      
      const script = await Script.findById(parseInt(id));
      
      if (!script) {
        return res.status(404).json({
          success: false,
          error: 'Roteiro não encontrado'
        });
      }

      // Verificar permissões
      const permissions = await script.checkUserPermission(req.user.id);
      if (!permissions.can_edit) {
        return res.status(403).json({
          success: false,
          error: 'Sem permissão para editar este roteiro'
        });
      }

      const message = await ScriptMessage.findById(parseInt(messageId));
      
      if (!message || message.script_id !== parseInt(id)) {
        return res.status(404).json({
          success: false,
          error: 'Mensagem não encontrada'
        });
      }

      const updatedMessage = await message.update(updateData);

      logger.info(`Mensagem atualizada no roteiro ${id} por ${req.user.username}`);

      res.json({
        success: true,
        message: 'Mensagem atualizada com sucesso',
        data: {
          message: updatedMessage.toResponseObject()
        }
      });
    } catch (error) {
      logger.error('Erro ao atualizar mensagem:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Excluir mensagem
  static async deleteMessage(req, res) {
    try {
      const { id, messageId } = req.params;
      
      const script = await Script.findById(parseInt(id));
      
      if (!script) {
        return res.status(404).json({
          success: false,
          error: 'Roteiro não encontrado'
        });
      }

      // Verificar permissões
      const permissions = await script.checkUserPermission(req.user.id);
      if (!permissions.can_edit) {
        return res.status(403).json({
          success: false,
          error: 'Sem permissão para editar este roteiro'
        });
      }

      const message = await ScriptMessage.findById(parseInt(messageId));
      
      if (!message || message.script_id !== parseInt(id)) {
        return res.status(404).json({
          success: false,
          error: 'Mensagem não encontrada'
        });
      }

      await message.delete();

      logger.info(`Mensagem excluída do roteiro ${id} por ${req.user.username}`);

      res.json({
        success: true,
        message: 'Mensagem excluída com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao excluir mensagem:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Reordenar mensagens
  static async reorderMessages(req, res) {
    try {
      const { id } = req.params;
      const { messages } = req.body;
      
      const script = await Script.findById(parseInt(id));
      
      if (!script) {
        return res.status(404).json({
          success: false,
          error: 'Roteiro não encontrado'
        });
      }

      // Verificar permissões
      const permissions = await script.checkUserPermission(req.user.id);
      if (!permissions.can_edit) {
        return res.status(403).json({
          success: false,
          error: 'Sem permissão para editar este roteiro'
        });
      }

      // Extrair IDs ordenados do array de mensagens
      const messageIds = Array.isArray(messages)
        ? messages.sort((a, b) => a.order - b.order).map(m => m.id)
        : [];

      await ScriptMessage.reorderMessages(parseInt(id), messageIds);

      logger.info(`Mensagens reordenadas no roteiro ${id} por ${req.user.username}`);

      res.json({
        success: true,
        message: 'Mensagens reordenadas com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao reordenar mensagens:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Obter estatísticas do roteiro
  static async getScriptStats(req, res) {
    try {
      const { id } = req.params;
      
      const script = await Script.findById(parseInt(id));
      
      if (!script) {
        return res.status(404).json({
          success: false,
          error: 'Roteiro não encontrado'
        });
      }

      const stats = await script.getStats();

      res.json({
        success: true,
        data: {
          script: script.toResponseObject(),
          stats
        }
      });
    } catch (error) {
      logger.error('Erro ao obter estatísticas do roteiro:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Buscar mensagens do roteiro
  static async getScriptMessages(req, res) {
    try {
      const { id } = req.params;
      const { 
        page, 
        limit, 
        character_id,
        order_by,
        order_direction 
      } = req.query;
      
      const script = await Script.findById(parseInt(id));
      
      if (!script) {
        return res.status(404).json({
          success: false,
          error: 'Roteiro não encontrado'
        });
      }

      const messages = await ScriptMessage.findByScript(parseInt(id), {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        character_id: character_id ? parseInt(character_id) : undefined,
        order_by,
        order_direction
      });

      res.json({
        success: true,
        data: {
          messages: messages.map(message => message.toResponseObject())
        }
      });
    } catch (error) {
      logger.error('Erro ao buscar mensagens do roteiro:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Exportar roteiro
  static async exportScript(req, res) {
    try {
      const { id } = req.params;
      const { format = 'json' } = req.query;
      
      const script = await Script.findById(parseInt(id), {
        includeMessages: true,
        includeCharacters: true
      });
      
      if (!script) {
        return res.status(404).json({
          success: false,
          error: 'Roteiro não encontrado'
        });
      }

      // Verificar permissões
      if (req.user) {
        const permissions = await script.checkUserPermission(req.user.id);
        if (!permissions.can_view) {
          return res.status(403).json({
            success: false,
            error: 'Acesso negado'
          });
        }
      } else if (!script.is_public) {
        return res.status(403).json({
          success: false,
          error: 'Roteiro privado'
        });
      }

      let exportData;
      
      switch (format.toLowerCase()) {
        case 'txt':
          exportData = ScriptController.formatAsText(script);
          res.setHeader('Content-Type', 'text/plain');
          res.setHeader('Content-Disposition', `attachment; filename="${script.title}.txt"`);
          return res.send(exportData);
          
        case 'json':
        default:
          exportData = ScriptController.formatAsJson(script);
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Content-Disposition', `attachment; filename="${script.title}.json"`);
          return res.json(exportData);
      }
    } catch (error) {
      logger.error('Erro ao exportar roteiro:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Formatar roteiro como texto
  static formatAsText(script) {
    let text = `${script.title}\n`;
    text += `${'='.repeat(script.title.length)}\n\n`;
    
    if (script.description) {
      text += `${script.description}\n\n`;
    }
    
    text += `Criado por: ${script.creator_name}\n`;
    text += `Data: ${new Date(script.created_at).toLocaleDateString('pt-BR')}\n\n`;
    text += `${'='.repeat(50)}\n\n`;
    
    if (script.messages && script.messages.length > 0) {
      script.messages.forEach((message, index) => {
        if (message.character_name) {
          text += `${message.character_name}: ${message.message}\n\n`;
        } else {
          text += `[Ação]: ${message.message}\n\n`;
        }
      });
    }
    
    return text;
  }

  // Formatar roteiro como JSON
  static formatAsJson(script) {
    return {
      id: script.id,
      title: script.title,
      description: script.description,
      creator: script.creator_name,
      created_at: script.created_at,
      updated_at: script.updated_at,
      is_public: script.is_public,
      characters: script.characters || [],
      messages: script.messages || [],
      stats: {
        message_count: script.message_count,
        character_count: script.character_count
      }
    };
  }
}

module.exports = ScriptController; 