const Joi = require('joi');

// Schemas de validação para usuários
const userSchemas = {
  // Validação para registro de usuário
  register: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.alphanum': 'Username deve conter apenas letras e números',
        'string.min': 'Username deve ter pelo menos 3 caracteres',
        'string.max': 'Username deve ter no máximo 30 caracteres',
        'any.required': 'Username é obrigatório'
      }),
    
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Email deve ser válido',
        'any.required': 'Email é obrigatório'
      }),
    
    password: Joi.string()
      .min(6)
      .max(100)
      .required()
      .messages({
        'string.min': 'Senha deve ter pelo menos 6 caracteres',
        'string.max': 'Senha deve ter no máximo 100 caracteres',
        'any.required': 'Senha é obrigatória'
      }),
    
    role: Joi.string()
      .valid('admin', 'editor', 'viewer')
      .default('viewer')
      .messages({
        'any.only': 'Role deve ser admin, editor ou viewer'
      })
  }),

  // Validação para login
  login: Joi.object({
    username: Joi.string()
      .required()
      .messages({
        'any.required': 'Username é obrigatório'
      }),
    
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Senha é obrigatória'
      })
  }),

  // Validação para atualização de usuário
  update: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .messages({
        'string.alphanum': 'Username deve conter apenas letras e números',
        'string.min': 'Username deve ter pelo menos 3 caracteres',
        'string.max': 'Username deve ter no máximo 30 caracteres'
      }),
    
    email: Joi.string()
      .email()
      .messages({
        'string.email': 'Email deve ser válido'
      }),
    
    password: Joi.string()
      .min(6)
      .max(100)
      .messages({
        'string.min': 'Senha deve ter pelo menos 6 caracteres',
        'string.max': 'Senha deve ter no máximo 100 caracteres'
      }),
    
    role: Joi.string()
      .valid('admin', 'editor', 'viewer')
      .messages({
        'any.only': 'Role deve ser admin, editor ou viewer'
      }),
    
    is_active: Joi.boolean()
      .messages({
        'boolean.base': 'is_active deve ser true ou false'
      })
  })
};

// Schemas de validação para personagens
const characterSchemas = {
  // Validação para criação de personagem
  create: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Nome deve ter pelo menos 2 caracteres',
        'string.max': 'Nome deve ter no máximo 100 caracteres',
        'any.required': 'Nome é obrigatório'
      }),
    
    color: Joi.string()
      .pattern(/^#[0-9A-F]{6}$/i)
      .required()
      .messages({
        'string.pattern.base': 'Cor deve ser um código HEX válido (ex: #FF0000)',
        'any.required': 'Cor é obrigatória'
      }),
    
    avatar_url: Joi.string()
      .uri()
      .allow(null, '')
      .messages({
        'string.uri': 'Avatar URL deve ser uma URL válida'
      })
  }),

  // Validação para atualização de personagem
  update: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .messages({
        'string.min': 'Nome deve ter pelo menos 2 caracteres',
        'string.max': 'Nome deve ter no máximo 100 caracteres'
      }),
    
    color: Joi.string()
      .pattern(/^#[0-9A-F]{6}$/i)
      .messages({
        'string.pattern.base': 'Cor deve ser um código HEX válido (ex: #FF0000)'
      }),
    
    avatar_url: Joi.string()
      .uri()
      .allow(null, '')
      .messages({
        'string.uri': 'Avatar URL deve ser uma URL válida'
      }),
    
    is_active: Joi.boolean()
      .messages({
        'boolean.base': 'is_active deve ser true ou false'
      })
  })
};

// Schemas de validação para roteiros
const scriptSchemas = {
  // Validação para criação de roteiro
  create: Joi.object({
    title: Joi.string()
      .min(3)
      .max(255)
      .required()
      .messages({
        'string.min': 'Título deve ter pelo menos 3 caracteres',
        'string.max': 'Título deve ter no máximo 255 caracteres',
        'any.required': 'Título é obrigatório'
      }),
    
    description: Joi.string()
      .max(1000)
      .allow(null, '')
      .messages({
        'string.max': 'Descrição deve ter no máximo 1000 caracteres'
      }),
    
    is_public: Joi.boolean()
      .default(false)
      .messages({
        'boolean.base': 'is_public deve ser true ou false'
      })
  }),

  // Validação para atualização de roteiro
  update: Joi.object({
    title: Joi.string()
      .min(3)
      .max(255)
      .messages({
        'string.min': 'Título deve ter pelo menos 3 caracteres',
        'string.max': 'Título deve ter no máximo 255 caracteres'
      }),
    
    description: Joi.string()
      .max(1000)
      .allow(null, '')
      .messages({
        'string.max': 'Descrição deve ter no máximo 1000 caracteres'
      }),
    
    is_public: Joi.boolean()
      .messages({
        'boolean.base': 'is_public deve ser true ou false'
      })
  })
};

// Schemas de validação para mensagens
const messageSchemas = {
  // Validação para criação de mensagem
  create: Joi.object({
    character_id: Joi.number()
      .integer()
      .positive()
      .allow(null)
      .messages({
        'number.base': 'ID do personagem deve ser um número',
        'number.integer': 'ID do personagem deve ser um número inteiro',
        'number.positive': 'ID do personagem deve ser positivo'
      }),
    
    message: Joi.string()
      .min(1)
      .max(2000)
      .required()
      .messages({
        'string.min': 'Mensagem deve ter pelo menos 1 caractere',
        'string.max': 'Mensagem deve ter no máximo 2000 caracteres',
        'any.required': 'Mensagem é obrigatória'
      }),
    
    order_index: Joi.number()
      .integer()
      .min(0)
      .default(0)
      .messages({
        'number.base': 'Índice de ordem deve ser um número',
        'number.integer': 'Índice de ordem deve ser um número inteiro',
        'number.min': 'Índice de ordem deve ser maior ou igual a 0'
      })
  }),

  // Validação para atualização de mensagem
  update: Joi.object({
    character_id: Joi.number()
      .integer()
      .positive()
      .allow(null)
      .messages({
        'number.base': 'ID do personagem deve ser um número',
        'number.integer': 'ID do personagem deve ser um número inteiro',
        'number.positive': 'ID do personagem deve ser positivo'
      }),
    
    message: Joi.string()
      .min(1)
      .max(2000)
      .messages({
        'string.min': 'Mensagem deve ter pelo menos 1 caractere',
        'string.max': 'Mensagem deve ter no máximo 2000 caracteres'
      }),
    
    order_index: Joi.number()
      .integer()
      .min(0)
      .messages({
        'number.base': 'Índice de ordem deve ser um número',
        'number.integer': 'Índice de ordem deve ser um número inteiro',
        'number.min': 'Índice de ordem deve ser maior ou igual a 0'
      })
  })
};

// Schemas de validação para compartilhamento
const shareSchemas = {
  // Validação para compartilhamento de roteiro
  share: Joi.object({
    shared_with: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'ID do usuário deve ser um número',
        'number.integer': 'ID do usuário deve ser um número inteiro',
        'number.positive': 'ID do usuário deve ser positivo',
        'any.required': 'ID do usuário é obrigatório'
      }),
    
    permission: Joi.string()
      .valid('view', 'edit')
      .default('view')
      .messages({
        'any.only': 'Permissão deve ser view ou edit'
      })
  }),

  // Validação para atualização de compartilhamento
  update: Joi.object({
    permission: Joi.string()
      .valid('view', 'edit')
      .required()
      .messages({
        'any.only': 'Permissão deve ser view ou edit',
        'any.required': 'Permissão é obrigatória'
      })
  })
};

// Schemas de validação para consultas
const querySchemas = {
  // Validação para paginação
  pagination: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .messages({
        'number.base': 'Página deve ser um número',
        'number.integer': 'Página deve ser um número inteiro',
        'number.min': 'Página deve ser maior ou igual a 1'
      }),
    
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10)
      .messages({
        'number.base': 'Limite deve ser um número',
        'number.integer': 'Limite deve ser um número inteiro',
        'number.min': 'Limite deve ser maior ou igual a 1',
        'number.max': 'Limite deve ser menor ou igual a 100'
      })
  }),

  // Validação para filtros de roteiros
  scriptFilters: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().max(100).allow(''),
    is_public: Joi.boolean(),
    created_by: Joi.number().integer().positive(),
    sort_by: Joi.string().valid('title', 'created_at', 'updated_at').default('created_at'),
    sort_order: Joi.string().valid('asc', 'desc').default('desc'),
    type: Joi.string().valid('all', 'user', 'public', 'shared').default('user')
  })
};

// Middleware de validação genérico
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors
      });
    }

    // Substituir req.body pelos dados validados
    req.body = value;
    next();
  };
};

// Middleware de validação para query parameters
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Parâmetros de consulta inválidos',
        details: errors
      });
    }

    // Substituir req.query pelos dados validados
    req.query = value;
    next();
  };
};

// Middleware de validação para parâmetros de URL
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Parâmetros de URL inválidos',
        details: errors
      });
    }

    // Substituir req.params pelos dados validados
    req.params = value;
    next();
  };
};

// Funções de validação específicas
const validateUser = (action) => {
  const schema = userSchemas[action];
  if (!schema) {
    throw new Error(`Schema de validação não encontrado para ação: ${action}`);
  }
  return validate(schema);
};

const validateCharacter = (action) => {
  const schema = characterSchemas[action];
  if (!schema) {
    throw new Error(`Schema de validação não encontrado para ação: ${action}`);
  }
  return validate(schema);
};

const validateScript = (action) => {
  const schema = scriptSchemas[action];
  if (!schema) {
    throw new Error(`Schema de validação não encontrado para ação: ${action}`);
  }
  return validate(schema);
};

const validateMessage = (action) => {
  const schema = messageSchemas[action];
  if (!schema) {
    throw new Error(`Schema de validação não encontrado para ação: ${action}`);
  }
  return validate(schema);
};

const validateShare = (action) => {
  const schema = shareSchemas[action];
  if (!schema) {
    throw new Error(`Schema de validação não encontrado para ação: ${action}`);
  }
  return validate(schema);
};

const validatePagination = () => {
  return validateQuery(querySchemas.pagination);
};

const validateScriptFilters = () => {
  return validateQuery(querySchemas.scriptFilters);
};

module.exports = {
  userSchemas,
  characterSchemas,
  scriptSchemas,
  messageSchemas,
  shareSchemas,
  querySchemas,
  validate,
  validateQuery,
  validateParams,
  validateUser,
  validateCharacter,
  validateScript,
  validateMessage,
  validateShare,
  validatePagination,
  validateScriptFilters
}; 