const ScriptShare = require('../models/ScriptShare');
const Script = require('../models/Script');
const User = require('../models/User');
const logger = require('../utils/logger');

class ShareController {
  // Listar compartilhamentos de um roteiro
  static async listScriptShares(req, res) {
    try {
      const { id } = req.params;
      const { page, limit } = req.query;
      
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
          error: 'Sem permissão para visualizar compartilhamentos deste roteiro'
        });
      }

      const result = await ScriptShare.findWithFilters({
        script_id: parseInt(id),
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10
      });

      res.json({
        success: true,
        data: {
          shares: result.shares.map(share => share.toResponseObject()),
          pagination: result.pagination
        }
      });
    } catch (error) {
      logger.error('Erro ao listar compartilhamentos do roteiro:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Listar compartilhamentos do usuário
  static async listUserShares(req, res) {
    try {
      const { page, limit } = req.query;
      
      const result = await ScriptShare.findWithFilters({
        shared_with: req.user.id,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10
      });

      res.json({
        success: true,
        data: {
          shares: result.shares.map(share => share.toResponseObject()),
          pagination: result.pagination
        }
      });
    } catch (error) {
      logger.error('Erro ao listar compartilhamentos do usuário:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Compartilhar roteiro
  static async shareScript(req, res) {
    try {
      const { id } = req.params;
      const { shared_with, permission = 'view' } = req.body;
      
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
          error: 'Sem permissão para compartilhar este roteiro'
        });
      }

      // Verificar se usuário existe
      const targetUser = await User.findById(parseInt(shared_with));
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

      // Não pode compartilhar consigo mesmo
      if (parseInt(shared_with) === req.user.id) {
        return res.status(400).json({
          success: false,
          error: 'Não é possível compartilhar um roteiro consigo mesmo'
        });
      }

      const share = await ScriptShare.create({
        script_id: parseInt(id),
        shared_by: req.user.id,
        shared_with: parseInt(shared_with),
        permission
      });

      logger.info(`Roteiro compartilhado por ${req.user.username}: ${script.title} com ${targetUser.username}`);

      res.status(201).json({
        success: true,
        message: 'Roteiro compartilhado com sucesso',
        data: {
          share: share.toResponseObject()
        }
      });
    } catch (error) {
      logger.error('Erro ao compartilhar roteiro:', error);
      
      if (error.message === 'Roteiro já está compartilhado com este usuário') {
        return res.status(409).json({
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

  // Atualizar permissão de compartilhamento
  static async updateShare(req, res) {
    try {
      const { id, shareId } = req.params;
      const { permission } = req.body;
      
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
          error: 'Sem permissão para editar compartilhamentos deste roteiro'
        });
      }

      const share = await ScriptShare.findById(parseInt(shareId));
      
      if (!share || share.script_id !== parseInt(id)) {
        return res.status(404).json({
          success: false,
          error: 'Compartilhamento não encontrado'
        });
      }

      const updatedShare = await share.update({ permission });

      logger.info(`Permissão atualizada por ${req.user.username}: ${script.title} com ${updatedShare.shared_with_name}`);

      res.json({
        success: true,
        message: 'Permissão atualizada com sucesso',
        data: {
          share: updatedShare.toResponseObject()
        }
      });
    } catch (error) {
      logger.error('Erro ao atualizar permissão:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Remover compartilhamento
  static async removeShare(req, res) {
    try {
      const { id, shareId } = req.params;
      
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
          error: 'Sem permissão para remover compartilhamentos deste roteiro'
        });
      }

      const share = await ScriptShare.findById(parseInt(shareId));
      
      if (!share || share.script_id !== parseInt(id)) {
        return res.status(404).json({
          success: false,
          error: 'Compartilhamento não encontrado'
        });
      }

      await share.delete();

      logger.info(`Compartilhamento removido por ${req.user.username}: ${script.title} com ${share.shared_with_name}`);

      res.json({
        success: true,
        message: 'Compartilhamento removido com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao remover compartilhamento:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Remover todos os compartilhamentos de um roteiro
  static async removeAllShares(req, res) {
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
      if (!permissions.can_edit) {
        return res.status(403).json({
          success: false,
          error: 'Sem permissão para remover compartilhamentos deste roteiro'
        });
      }

      await ScriptShare.deleteByScript(parseInt(id));

      logger.info(`Todos os compartilhamentos removidos por ${req.user.username}: ${script.title}`);

      res.json({
        success: true,
        message: 'Todos os compartilhamentos removidos com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao remover todos os compartilhamentos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Buscar usuários para compartilhamento
  static async searchUsers(req, res) {
    try {
      const { search, page, limit } = req.query;
      
      const result = await User.findWithFilters({
        search,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10
      });

      // Filtrar o usuário atual da lista
      const filteredUsers = result.users.filter(user => user.id !== req.user.id);

      res.json({
        success: true,
        data: {
          users: filteredUsers.map(user => user.toSimpleObject()),
          pagination: {
            ...result.pagination,
            total: filteredUsers.length
          }
        }
      });
    } catch (error) {
      logger.error('Erro ao buscar usuários:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Verificar permissões de compartilhamento
  static async checkSharePermissions(req, res) {
    try {
      const { id } = req.params;
      
      const script = await Script.findById(parseInt(id));
      
      if (!script) {
        return res.status(404).json({
          success: false,
          error: 'Roteiro não encontrado'
        });
      }

      const permissions = await script.checkUserPermission(req.user.id);

      res.json({
        success: true,
        data: {
          permissions,
          can_share: permissions.can_edit || permissions.can_delete
        }
      });
    } catch (error) {
      logger.error('Erro ao verificar permissões:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Obter estatísticas de compartilhamento
  static async getShareStats(req, res) {
    try {
      const stats = await ScriptShare.getStats();

      res.json({
        success: true,
        data: {
          stats
        }
      });
    } catch (error) {
      logger.error('Erro ao obter estatísticas de compartilhamento:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Compartilhar roteiro por email (futuro)
  static async shareByEmail(req, res) {
    try {
      const { id } = req.params;
      const { email, permission = 'view' } = req.body;
      
      // TODO: Implementar busca de usuário por email
      // TODO: Implementar notificação por email
      
      res.status(501).json({
        success: false,
        error: 'Funcionalidade não implementada'
      });
    } catch (error) {
      logger.error('Erro ao compartilhar por email:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Gerar link público de compartilhamento (futuro)
  static async generatePublicLink(req, res) {
    try {
      const { id } = req.params;
      
      // TODO: Implementar geração de links públicos
      
      res.status(501).json({
        success: false,
        error: 'Funcionalidade não implementada'
      });
    } catch (error) {
      logger.error('Erro ao gerar link público:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }
}

module.exports = ShareController; 