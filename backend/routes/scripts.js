const express = require('express');
const router = express.Router();
const ScriptController = require('../controllers/scriptController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/authorization');
const { validateScript, validateMessage, validatePagination } = require('../utils/validation');

// Rotas públicas (não requerem autenticação)
router.get('/', validatePagination(), ScriptController.listScripts);
router.get('/public', validatePagination(), ScriptController.listScripts);
router.get('/:id', ScriptController.getScript);
router.get('/:id/messages', validatePagination(), ScriptController.getScriptMessages);
router.get('/:id/export', ScriptController.exportScript);

// Rotas protegidas (requerem autenticação)
router.use(authenticateToken);

// Rotas de roteiros do usuário
router.get('/user/scripts', validatePagination(), ScriptController.listScripts);
router.get('/user/shared', validatePagination(), ScriptController.listScripts);

// CRUD de roteiros
router.post('/', validateScript('create'), ScriptController.createScript);
router.put('/:id', validateScript('update'), ScriptController.updateScript);
router.delete('/:id', ScriptController.deleteScript);

// Gestão de mensagens
router.post('/:id/messages', validateMessage('create'), ScriptController.addMessage);
router.put('/:id/messages/:messageId', validateMessage('update'), ScriptController.updateMessage);
router.delete('/:id/messages/:messageId', ScriptController.deleteMessage);
router.post('/:id/messages/reorder', ScriptController.reorderMessages);
router.post('/:id/messages/:messageId/duplicate', ScriptController.duplicateMessage);

// Estatísticas e informações
router.get('/:id/stats', ScriptController.getScriptStats);

module.exports = router; 