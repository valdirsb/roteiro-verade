const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorization');
const Script = require('../models/Script');
const Character = require('../models/Character');
const ScriptShare = require('../models/ScriptShare');
const User = require('../models/User');
const database = require('../config/database');
const logger = require('../utils/logger');

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

/**
 * @route   GET /api/stats
 * @desc    Obter estatísticas globais do sistema
 * @access  Private (Admin, Editor, Viewer)
 */
router.get('/', async (req, res) => {
  try {
    console.log('DEBUG: Iniciando rota /api/stats');
    console.log('DEBUG: Usuário:', req.user);
    
    logger.info('Obtendo estatísticas globais', {
      service: 'roteiro-verade-backend',
      userId: req.user.id
    });

    // Contar roteiros
    const scriptsResult = await database.query('SELECT COUNT(*) as count FROM scripts');
    const scriptsCount = scriptsResult[0].count;
    console.log('DEBUG: Scripts count:', scriptsCount);
    
    // Contar personagens (customizados)
    const charactersResult = await database.query('SELECT COUNT(*) as count FROM characters');
    const charactersCount = charactersResult[0].count;
    console.log('DEBUG: Characters count:', charactersCount);
    
    // Contar compartilhamentos
    const sharesResult = await database.query('SELECT COUNT(*) as count FROM script_shares');
    const sharesCount = sharesResult[0].count;
    console.log('DEBUG: Shares count:', sharesCount);
    
    // Contar usuários
    const usersResult = await database.query('SELECT COUNT(*) as count FROM users');
    const usersCount = usersResult[0].count;
    console.log('DEBUG: Users count:', usersCount);
    
    // Roteiros por visibilidade (público/privado)
    const scriptsByVisibilityResult = await database.query(`
      SELECT 
        is_public,
        COUNT(*) as count
      FROM scripts 
      GROUP BY is_public
    `);

    // Roteiros recentes (últimos 5)
    const recentScriptsResult = await database.query(`
      SELECT 
        s.id,
        s.title,
        s.description,
        s.is_public,
        s.updated_at,
        COUNT(sm.id) as messageCount
      FROM scripts s
      LEFT JOIN script_messages sm ON s.id = sm.script_id
      GROUP BY s.id, s.title, s.description, s.is_public, s.updated_at
      ORDER BY s.updated_at DESC
      LIMIT 5
    `);

    // Estatísticas de atividade (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivityResult = await database.query(`
      SELECT COUNT(*) as count 
      FROM scripts 
      WHERE updated_at >= ?
    `, [thirtyDaysAgo]);

    const stats = {
      total: {
        scripts: scriptsCount,
        characters: charactersCount + 5, // +5 personagens padrão
        shares: sharesCount,
        users: usersCount
      },
      scripts: {
        byVisibility: scriptsByVisibilityResult,
        recent: recentScriptsResult,
        recentActivity: recentActivityResult[0].count
      },
      generatedAt: new Date().toISOString()
    };

    console.log('DEBUG: Stats object:', JSON.stringify(stats, null, 2));
    console.log('DEBUG: Enviando resposta...');

    res.json({
      success: true,
      data: stats
    });

    console.log('DEBUG: Resposta enviada com sucesso');

  } catch (error) {
    logger.error('Erro ao obter estatísticas globais', {
      service: 'roteiro-verade-backend',
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: {
        type: 'database_error',
        message: 'Erro ao obter estatísticas do sistema'
      }
    });
  }
});

/**
 * @route   GET /api/stats/scripts
 * @desc    Obter estatísticas específicas de roteiros
 * @access  Private (Admin, Editor, Viewer)
 */
router.get('/scripts', async (req, res) => {
  try {
    logger.info('Obtendo estatísticas de roteiros', {
      service: 'roteiro-verade-backend',
      userId: req.user.id
    });

    // Contagem total
    const totalResult = await database.query('SELECT COUNT(*) as count FROM scripts');
    const totalScripts = totalResult[0].count;
    
    // Contagem por visibilidade
    const scriptsByVisibilityResult = await database.query(`
      SELECT 
        is_public,
        COUNT(*) as count
      FROM scripts 
      GROUP BY is_public
    `);

    // Roteiros com mais mensagens
    const topScriptsByMessagesResult = await database.query(`
      SELECT 
        s.id,
        s.title,
        COUNT(sm.id) as messageCount
      FROM scripts s
      LEFT JOIN script_messages sm ON s.id = sm.script_id
      GROUP BY s.id, s.title
      ORDER BY messageCount DESC
      LIMIT 10
    `);

    // Roteiros mais recentes
    const recentScriptsResult = await database.query(`
      SELECT 
        s.id,
        s.title,
        s.description,
        s.is_public,
        s.updated_at,
        COUNT(sm.id) as messageCount
      FROM scripts s
      LEFT JOIN script_messages sm ON s.id = sm.script_id
      GROUP BY s.id, s.title, s.description, s.is_public, s.updated_at
      ORDER BY s.updated_at DESC
      LIMIT 10
    `);

    // Atividade por período
    const now = new Date();
    const periods = [
      { name: 'hoje', days: 1 },
      { name: 'semana', days: 7 },
      { name: 'mês', days: 30 },
      { name: 'trimestre', days: 90 }
    ];

    const activityByPeriod = {};
    
    for (const period of periods) {
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - period.days);
      
      const countResult = await database.query(`
        SELECT COUNT(*) as count 
        FROM scripts 
        WHERE updated_at >= ?
      `, [startDate]);
      
      activityByPeriod[period.name] = countResult[0].count;
    }

    const stats = {
      total: totalScripts,
      byVisibility: scriptsByVisibilityResult,
      topByMessages: topScriptsByMessagesResult,
      recent: recentScriptsResult,
      activity: activityByPeriod,
      generatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Erro ao obter estatísticas de roteiros', {
      service: 'roteiro-verade-backend',
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: {
        type: 'database_error',
        message: 'Erro ao obter estatísticas de roteiros'
      }
    });
  }
});

/**
 * @route   GET /api/stats/characters
 * @desc    Obter estatísticas de personagens
 * @access  Private (Admin, Editor, Viewer)
 */
router.get('/characters', async (req, res) => {
  try {
    logger.info('Obtendo estatísticas de personagens', {
      service: 'roteiro-verade-backend',
      userId: req.user.id
    });

    // Contagem total (customizados + padrão)
    const customCharactersResult = await database.query('SELECT COUNT(*) as count FROM characters');
    const customCharactersCount = customCharactersResult[0].count;
    const totalCharacters = customCharactersCount + 5; // +5 personagens padrão

    // Personagens mais utilizados (baseado em mensagens)
    const topCharactersResult = await database.query(`
      SELECT 
        c.id,
        c.name,
        c.color,
        COUNT(sm.id) as usage_count
      FROM characters c
      LEFT JOIN script_messages sm ON c.id = sm.character_id
      GROUP BY c.id, c.name, c.color
      ORDER BY usage_count DESC
      LIMIT 10
    `);

    // Personagens criados por período
    const now = new Date();
    const periods = [
      { name: 'hoje', days: 1 },
      { name: 'semana', days: 7 },
      { name: 'mês', days: 30 }
    ];

    const createdByPeriod = {};
    
    for (const period of periods) {
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - period.days);
      
      const countResult = await database.query(`
        SELECT COUNT(*) as count 
        FROM characters 
        WHERE created_at >= ?
      `, [startDate]);
      
      createdByPeriod[period.name] = countResult[0].count;
    }

    const stats = {
      total: totalCharacters,
      custom: customCharactersCount,
      default: 5,
      topUsed: topCharactersResult,
      createdByPeriod,
      generatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Erro ao obter estatísticas de personagens', {
      service: 'roteiro-verade-backend',
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: {
        type: 'database_error',
        message: 'Erro ao obter estatísticas de personagens'
      }
    });
  }
});

/**
 * @route   GET /api/stats/shares
 * @desc    Obter estatísticas de compartilhamentos
 * @access  Private (Admin, Editor, Viewer)
 */
router.get('/shares', async (req, res) => {
  try {
    logger.info('Obtendo estatísticas de compartilhamentos', {
      service: 'roteiro-verade-backend',
      userId: req.user.id
    });

    // Contagem total
    const totalResult = await database.query('SELECT COUNT(*) as count FROM script_shares');
    const totalShares = totalResult[0].count;

    // Compartilhamentos por tipo de permissão
    const sharesByPermissionResult = await database.query(`
      SELECT 
        permission,
        COUNT(*) as count
      FROM script_shares
      GROUP BY permission
    `);

    // Roteiros mais compartilhados
    const topSharedScriptsResult = await database.query(`
      SELECT 
        ss.script_id,
        s.title,
        COUNT(ss.id) as share_count
      FROM script_shares ss
      LEFT JOIN scripts s ON ss.script_id = s.id
      GROUP BY ss.script_id, s.title
      ORDER BY share_count DESC
      LIMIT 10
    `);

    // Compartilhamentos por período
    const now = new Date();
    const periods = [
      { name: 'hoje', days: 1 },
      { name: 'semana', days: 7 },
      { name: 'mês', days: 30 }
    ];

    const sharesByPeriod = {};
    
    for (const period of periods) {
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - period.days);
      
      const countResult = await database.query(`
        SELECT COUNT(*) as count 
        FROM script_shares 
        WHERE created_at >= ?
      `, [startDate]);
      
      sharesByPeriod[period.name] = countResult[0].count;
    }

    const stats = {
      total: totalShares,
      byPermission: sharesByPermissionResult,
      topSharedScripts: topSharedScriptsResult,
      byPeriod: sharesByPeriod,
      generatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Erro ao obter estatísticas de compartilhamentos', {
      service: 'roteiro-verade-backend',
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: {
        type: 'database_error',
        message: 'Erro ao obter estatísticas de compartilhamentos'
      }
    });
  }
});

module.exports = router; 