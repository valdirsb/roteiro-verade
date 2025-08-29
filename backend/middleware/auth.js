const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

// Middleware de autenticação
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token de acesso não fornecido'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuário no banco
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error: 'Usuário desativado'
      });
    }

    // Adicionar usuário à requisição
    req.user = user;
    
    // Log da autenticação
    logger.info(`Usuário autenticado: ${user.username} (ID: ${user.id}) - ${req.method} ${req.url}`);
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expirado'
      });
    }

    logger.error('Erro na autenticação:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno na autenticação'
    });
  }
};

// Middleware opcional de autenticação (não falha se não houver token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (user && user.is_active) {
        req.user = user;
        logger.info(`Usuário autenticado (opcional): ${user.username} (ID: ${user.id})`);
      }
    }
    
    next();
  } catch (error) {
    // Ignora erros de token inválido em autenticação opcional
    next();
  }
};

// Gerar token de acesso
const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id,
      username: user.username,
      role: user.role
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    }
  );
};

// Gerar refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id,
      type: 'refresh'
    },
    process.env.JWT_REFRESH_SECRET,
    { 
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    }
  );
};

// Verificar refresh token
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    
    if (decoded.type !== 'refresh') {
      throw new Error('Token inválido');
    }
    
    return decoded;
  } catch (error) {
    throw error;
  }
};

// Middleware para verificar se usuário está logado (sem verificar token)
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Autenticação necessária'
    });
  }
  next();
};

// Middleware para verificar se usuário é admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Autenticação necessária'
    });
  }

  if (!req.user.isAdmin()) {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado. Permissão de administrador necessária.'
    });
  }

  next();
};

// Middleware para verificar se usuário é editor ou admin
const requireEditor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Autenticação necessária'
    });
  }

  if (!req.user.isEditor()) {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado. Permissão de editor necessária.'
    });
  }

  next();
};

// Middleware para verificar role específica
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Autenticação necessária'
      });
    }

    if (!req.user.hasPermission(requiredRole)) {
      return res.status(403).json({
        success: false,
        error: `Acesso negado. Permissão de ${requiredRole} necessária.`
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAuth,
  requireAdmin,
  requireEditor,
  requireRole,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
}; 