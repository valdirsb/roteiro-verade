require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Importar middlewares e configurações
const corsMiddleware = require('./middleware/cors');
const errorHandler = require('./middleware/errorHandler');
const { serveStaticFiles } = require('./middleware/upload');
const logger = require('./utils/logger');
const database = require('./config/database');

// Importar rotas
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração de rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limite por IP
  message: {
    success: false,
    error: 'Muitas requisições, tente novamente mais tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Middlewares de segurança e performance
app.use(helmet());
app.use(compression());
app.use(limiter);

// Middleware de CORS
app.use(corsMiddleware);

// Middleware de logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Middlewares de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_PATH || 'uploads')));

// Middleware de logging de requisições
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Rotas da API
app.use('/api', routes);

// Middleware para servir arquivos de upload via API
app.use('/api/uploads', serveStaticFiles);

// Servir a documentação da API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rota para arquivos não encontrados
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada'
  });
});

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

// Função para iniciar o servidor
async function startServer() {
  try {
    // Conectar ao banco de dados
    await database.connect();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info(`🚀 Servidor rodando na porta ${PORT}`);
      logger.info(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 URL: http://localhost:${PORT}`);
      logger.info(`📋 Health Check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    logger.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Tratamento de sinais para graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('🛑 Recebido SIGTERM, encerrando servidor...');
  await database.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('🛑 Recebido SIGINT, encerrando servidor...');
  await database.close();
  process.exit(0);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  logger.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Iniciar servidor
startServer(); 