const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

// Definição dos Schemas da API (baseado nos Models)
const schemas = {
  User: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      username: { type: 'string', example: 'admin' },
      email: { type: 'string', format: 'email', example: 'admin@example.com' },
      role: { type: 'string', enum: ['admin', 'editor', 'viewer'], example: 'admin' },
      created_at: { type: 'string', format: 'date-time' },
    },
  },
  Character: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      name: { type: 'string', example: 'Camila' },
      description: { type: 'string', example: 'Apresentadora principal.' },
      image_url: { type: 'string', format: 'uri', example: 'http://example.com/camila.png' },
      color: { type: 'string', example: '#FF0000' },
    },
  },
  Script: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 101 },
      title: { type: 'string', example: 'A História do Universo' },
      description: { type: 'string', example: 'Um roteiro sobre a origem do cosmos.' },
      is_public: { type: 'boolean', example: true },
      creator_name: { type: 'string', example: 'João da Silva' },
      created_at: { type: 'string', format: 'date-time' },
      message_count: { type: 'integer', example: 8 },
      character_count: { type: 'integer', example: 5 },
    },
  },
  ScriptMessage: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      script_id: { type: 'integer', example: 101 },
      character_id: { type: 'integer', example: 1 },
      character_name: { type: 'string', example: 'Camila' },
      message: { type: 'string', example: 'Olá a todos e bem-vindos!' },
      order: { type: 'integer', example: 1 },
    },
  },
  Error: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      error: {
        type: 'object',
        properties: {
          type: { type: 'string', example: 'validation_error' },
          message: { type: 'string', example: 'Dados inválidos fornecidos.' },
        },
      },
    },
  },
};

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Roteiro Verade API',
      version: '1.0.0',
      description:
        'API para o sistema de criação e gerenciamento de roteiros do canal Mundo em Verade. ' +
        'Oferece recursos para autenticação, gerenciamento de personagens, roteiros, mensagens e compartilhamentos.',
      contact: {
        name: 'Suporte Roteiro Verade',
        email: 'suporte@mundoemverade.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Servidor de Desenvolvimento',
      },
    ],
    components: {
      schemas,
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Caminho para os arquivos que contêm as anotações da API
  apis: [path.join(__dirname, '../routes/*.js')],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

module.exports = swaggerSpec; 