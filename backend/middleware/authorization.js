const logger = require('../utils/logger');

// Middleware de autorização baseado em roles
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Autenticação necessária'
        });
      }

      // Se não há roles específicas, permite acesso
      if (allowedRoles.length === 0) {
        return next();
      }

      // Verificar se o usuário tem uma das roles permitidas
      const hasPermission = allowedRoles.some(role => {
        return req.user.hasPermission(role);
      });

      if (!hasPermission) {
        logger.warn(`Acesso negado: ${req.user.username} (${req.user.role}) tentou acessar ${req.method} ${req.url}`);
        
        return res.status(403).json({
          success: false,
          error: 'Acesso negado. Permissões insuficientes.',
          required: allowedRoles,
          current: req.user.role
        });
      }

      logger.info(`Acesso autorizado: ${req.user.username} (${req.user.role}) - ${req.method} ${req.url}`);
      next();
    } catch (error) {
      logger.error('Erro na autorização:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno na autorização'
      });
    }
  };
};

// Middleware para verificar se usuário é dono do recurso ou admin
const authorizeOwnerOrAdmin = (resourceUserIdField = 'created_by') => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Autenticação necessária'
        });
      }

      // Admin pode acessar qualquer recurso
      if (req.user.isAdmin()) {
        return next();
      }

      // Verificar se o usuário é dono do recurso
      const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
      
      if (!resourceUserId) {
        return res.status(400).json({
          success: false,
          error: 'ID do usuário do recurso não fornecido'
        });
      }

      if (parseInt(resourceUserId) === req.user.id) {
        return next();
      }

      logger.warn(`Acesso negado: ${req.user.username} tentou acessar recurso de outro usuário`);
      
      return res.status(403).json({
        success: false,
        error: 'Acesso negado. Você só pode acessar seus próprios recursos.'
      });
    } catch (error) {
      logger.error('Erro na autorização de proprietário:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno na autorização'
      });
    }
  };
};

// Middleware para verificar permissões específicas
const authorizeAction = (action, resource) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Autenticação necessária'
        });
      }

      // Mapeamento de ações para roles necessárias
      const actionPermissions = {
        'create': {
          'script': ['editor', 'admin'],
          'character': ['admin'],
          'user': ['admin']
        },
        'read': {
          'script': ['viewer', 'editor', 'admin'],
          'character': ['viewer', 'editor', 'admin'],
          'user': ['admin']
        },
        'update': {
          'script': ['editor', 'admin'],
          'character': ['admin'],
          'user': ['admin']
        },
        'delete': {
          'script': ['editor', 'admin'],
          'character': ['admin'],
          'user': ['admin']
        }
      };

      const requiredRoles = actionPermissions[action]?.[resource];
      
      if (!requiredRoles) {
        logger.warn(`Ação não mapeada: ${action} em ${resource}`);
        return res.status(403).json({
          success: false,
          error: 'Ação não permitida'
        });
      }

      const hasPermission = requiredRoles.some(role => req.user.hasPermission(role));

      if (!hasPermission) {
        logger.warn(`Acesso negado: ${req.user.username} (${req.user.role}) tentou ${action} em ${resource}`);
        
        return res.status(403).json({
          success: false,
          error: `Permissão negada para ${action} em ${resource}`,
          required: requiredRoles,
          current: req.user.role
        });
      }

      logger.info(`Ação autorizada: ${req.user.username} (${req.user.role}) - ${action} ${resource}`);
      next();
    } catch (error) {
      logger.error('Erro na autorização de ação:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno na autorização'
      });
    }
  };
};

// Middleware para verificar se usuário pode acessar roteiro público ou próprio
const authorizeScriptAccess = () => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Autenticação necessária'
        });
      }

      const scriptId = req.params.id || req.params.scriptId;
      
      if (!scriptId) {
        return res.status(400).json({
          success: false,
          error: 'ID do roteiro não fornecido'
        });
      }

      // Admin pode acessar qualquer roteiro
      if (req.user.isAdmin()) {
        return next();
      }

      // Buscar informações do roteiro
      const database = require('../config/database');
      const sql = 'SELECT created_by, is_public FROM scripts WHERE id = ?';
      const scripts = await database.query(sql, [scriptId]);

      if (scripts.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Roteiro não encontrado'
        });
      }

      const script = scripts[0];

      // Verificar se é público ou se o usuário é dono
      if (script.is_public || script.created_by === req.user.id) {
        return next();
      }

      // Verificar se o roteiro foi compartilhado com o usuário
      const shareSql = 'SELECT * FROM script_shares WHERE script_id = ? AND shared_with = ?';
      const shares = await database.query(shareSql, [scriptId, req.user.id]);

      if (shares.length > 0) {
        return next();
      }

      logger.warn(`Acesso negado: ${req.user.username} tentou acessar roteiro privado ${scriptId}`);
      
      return res.status(403).json({
        success: false,
        error: 'Acesso negado. Roteiro privado.'
      });
    } catch (error) {
      logger.error('Erro na autorização de acesso ao roteiro:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno na autorização'
      });
    }
  };
};

// Middleware para registrar atividade
const logActivity = (action, resource) => {
  return async (req, res, next) => {
    try {
      const originalSend = res.json;
      
      res.json = function(data) {
        // Registrar atividade apenas se a operação foi bem-sucedida
        if (data.success && req.user) {
          const database = require('../config/database');
          const sql = `
            INSERT INTO activity_logs (user_id, action, table_name, record_id, details, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;
          
          const details = {
            method: req.method,
            url: req.url,
            body: req.body,
            params: req.params
          };

          database.query(sql, [
            req.user.id,
            action,
            resource,
            req.params.id || null,
            JSON.stringify(details),
            req.ip,
            req.get('User-Agent')
          ]).catch(err => {
            logger.error('Erro ao registrar atividade:', err);
          });
        }
        
        originalSend.call(this, data);
      };
      
      next();
    } catch (error) {
      logger.error('Erro no middleware de log de atividade:', error);
      next();
    }
  };
};

// Middleware para verificar roles específicas (alias para authorize)
const requireRole = (allowedRoles) => {
  return authorize(allowedRoles);
};

module.exports = {
  authorize,
  requireRole,
  authorizeOwnerOrAdmin,
  authorizeAction,
  authorizeScriptAccess,
  logActivity
}; 