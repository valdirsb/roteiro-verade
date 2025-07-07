const User = require('../models/User');
const { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken 
} = require('../middleware/auth');
const logger = require('../utils/logger');

class AuthController {
  // Registro de usuário
  static async register(req, res) {
    try {
      const { username, email, password, role } = req.body;

      // Criar usuário
      const user = await User.create({
        username,
        email,
        password,
        role
      });

      // Gerar tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      logger.info(`Novo usuário registrado: ${user.username} (ID: ${user.id})`);

      res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso',
        data: {
          user: user.toResponseObject(),
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      logger.error('Erro no registro:', error);
      
      if (error.message === 'Username ou email já existe') {
        return res.status(409).json({
          success: false,
          error: 'Username ou email já está em uso'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Login de usuário
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      // Buscar usuário por username ou email
      let user = await User.findByUsername(username);
      if (!user) {
        user = await User.findByEmail(username);
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Credenciais inválidas'
        });
      }

      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          error: 'Usuário desativado'
        });
      }

      // Verificar senha
      const isValidPassword = await user.verifyPassword(password);
      if (!isValidPassword) {
        logger.warn(`Tentativa de login falhou para usuário: ${username}`);
        return res.status(401).json({
          success: false,
          error: 'Credenciais inválidas'
        });
      }

      // Gerar tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      logger.info(`Login realizado com sucesso: ${user.username} (ID: ${user.id})`);

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          user: user.toResponseObject(),
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      logger.error('Erro no login:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Logout (opcional - para invalidar refresh tokens)
  static async logout(req, res) {
    try {
      // Em uma implementação mais robusta, você poderia invalidar o refresh token
      // adicionando-o a uma blacklist ou removendo do banco de dados
      
      logger.info(`Logout realizado: ${req.user.username} (ID: ${req.user.id})`);

      res.json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      logger.error('Erro no logout:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Refresh token
  static async refresh(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token é obrigatório'
        });
      }

      // Verificar refresh token
      const decoded = verifyRefreshToken(refreshToken);
      
      // Buscar usuário
      const user = await User.findById(decoded.userId);
      
      if (!user || !user.is_active) {
        return res.status(401).json({
          success: false,
          error: 'Refresh token inválido'
        });
      }

      // Gerar novos tokens
      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      logger.info(`Token renovado: ${user.username} (ID: ${user.id})`);

      res.json({
        success: true,
        message: 'Token renovado com sucesso',
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        }
      });
    } catch (error) {
      logger.error('Erro no refresh token:', error);
      
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Refresh token inválido ou expirado'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Obter perfil do usuário atual
  static async getProfile(req, res) {
    try {
      res.json({
        success: true,
        data: {
          user: req.user.toResponseObject()
        }
      });
    } catch (error) {
      logger.error('Erro ao obter perfil:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Atualizar perfil do usuário
  static async updateProfile(req, res) {
    try {
      const { username, email, password } = req.body;
      
      // Verificar se username ou email já existem (exceto para o usuário atual)
      if (username) {
        const existingUser = await User.findByUsername(username);
        if (existingUser && existingUser.id !== req.user.id) {
          return res.status(409).json({
            success: false,
            error: 'Username já está em uso'
          });
        }
      }

      if (email) {
        const existingUser = await User.findByEmail(email);
        if (existingUser && existingUser.id !== req.user.id) {
          return res.status(409).json({
            success: false,
            error: 'Email já está em uso'
          });
        }
      }

      // Atualizar usuário
      const updatedUser = await req.user.update({
        username,
        email,
        password
      });

      logger.info(`Perfil atualizado: ${updatedUser.username} (ID: ${updatedUser.id})`);

      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: {
          user: updatedUser.toResponseObject()
        }
      });
    } catch (error) {
      logger.error('Erro ao atualizar perfil:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Alterar senha
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      // Verificar senha atual
      const isValidPassword = await req.user.verifyPassword(currentPassword);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          error: 'Senha atual incorreta'
        });
      }

      // Atualizar senha
      await req.user.update({ password: newPassword });

      logger.info(`Senha alterada: ${req.user.username} (ID: ${req.user.id})`);

      res.json({
        success: true,
        message: 'Senha alterada com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao alterar senha:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Verificar se token é válido
  static async verifyToken(req, res) {
    try {
      res.json({
        success: true,
        message: 'Token válido',
        data: {
          user: req.user.toResponseObject()
        }
      });
    } catch (error) {
      logger.error('Erro ao verificar token:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Listar usuários (apenas admin)
  static async listUsers(req, res) {
    try {
      const { page, limit, role, is_active } = req.query;
      
      const result = await User.findAll({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        role,
        is_active: is_active === 'true' ? 1 : is_active === 'false' ? 0 : undefined
      });

      res.json({
        success: true,
        data: {
          users: result.users.map(user => user.toResponseObject()),
          pagination: result.pagination
        }
      });
    } catch (error) {
      logger.error('Erro ao listar usuários:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Obter usuário por ID (apenas admin)
  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      
      const user = await User.findById(parseInt(id));
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

      res.json({
        success: true,
        data: {
          user: user.toResponseObject()
        }
      });
    } catch (error) {
      logger.error('Erro ao obter usuário:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Atualizar usuário (apenas admin)
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const user = await User.findById(parseInt(id));
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

      // Verificar se username ou email já existem
      if (updateData.username) {
        const existingUser = await User.findByUsername(updateData.username);
        if (existingUser && existingUser.id !== parseInt(id)) {
          return res.status(409).json({
            success: false,
            error: 'Username já está em uso'
          });
        }
      }

      if (updateData.email) {
        const existingUser = await User.findByEmail(updateData.email);
        if (existingUser && existingUser.id !== parseInt(id)) {
          return res.status(409).json({
            success: false,
            error: 'Email já está em uso'
          });
        }
      }

      const updatedUser = await user.update(updateData);

      logger.info(`Usuário atualizado por admin: ${updatedUser.username} (ID: ${updatedUser.id})`);

      res.json({
        success: true,
        message: 'Usuário atualizado com sucesso',
        data: {
          user: updatedUser.toResponseObject()
        }
      });
    } catch (error) {
      logger.error('Erro ao atualizar usuário:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }

  // Desativar usuário (apenas admin)
  static async deactivateUser(req, res) {
    try {
      const { id } = req.params;
      
      const user = await User.findById(parseInt(id));
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

      // Não permitir desativar o próprio usuário
      if (user.id === req.user.id) {
        return res.status(400).json({
          success: false,
          error: 'Não é possível desativar sua própria conta'
        });
      }

      await user.deactivate();

      logger.info(`Usuário desativado por admin: ${user.username} (ID: ${user.id})`);

      res.json({
        success: true,
        message: 'Usuário desativado com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao desativar usuário:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }
}

module.exports = AuthController; 