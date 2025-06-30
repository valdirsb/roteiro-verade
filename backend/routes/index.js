const express = require('express');
const router = express.Router();

// Importar rotas
const authRoutes = require('./auth');
const characterRoutes = require('./characters');
const scriptRoutes = require('./scripts');
const shareRoutes = require('./shares');

// Rota de health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Roteiro Verade funcionando!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rota raiz
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bem-vindo à API do Roteiro Verade',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      characters: '/api/characters',
      scripts: '/api/scripts',
      shares: '/api/shares'
    }
  });
});

// Usar rotas
router.use('/auth', authRoutes);
router.use('/characters', characterRoutes);
router.use('/scripts', scriptRoutes);
router.use('/shares', shareRoutes);

module.exports = router; 