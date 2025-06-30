const logger = require('../utils/logger');

// Middleware de tratamento de erros
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log do erro
  logger.error(`Erro: ${err.message}`, {
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Erro de validação do MySQL
  if (err.code === 'ER_DUP_ENTRY') {
    const message = 'Dados duplicados';
    error = { message, statusCode: 400 };
  }

  // Erro de chave estrangeira
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    const message = 'Referência inválida';
    error = { message, statusCode: 400 };
  }

  // Erro de validação Joi
  if (err.isJoi) {
    const message = err.details.map(detail => detail.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // Erro de autenticação JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token inválido';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expirado';
    error = { message, statusCode: 401 };
  }

  // Erro de autorização
  if (err.name === 'UnauthorizedError') {
    const message = 'Acesso negado';
    error = { message, statusCode: 403 };
  }

  // Erro de validação do Express Validator
  if (err.type === 'entity.parse.failed') {
    const message = 'JSON inválido';
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler; 