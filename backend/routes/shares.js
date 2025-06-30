const express = require('express');
const router = express.Router();
const ShareController = require('../controllers/shareController');
const { authenticateToken } = require('../middleware/auth');
const { validateShare, validatePagination } = require('../utils/validation');

// Todas as rotas de compartilhamento requerem autenticação
router.use(authenticateToken);

// Rotas de compartilhamento de roteiros
router.get('/script/:id', validatePagination(), ShareController.listScriptShares);
router.get('/user', validatePagination(), ShareController.listUserShares);
router.post('/script/:id', validateShare('share'), ShareController.shareScript);
router.put('/script/:id/:shareId', validateShare('update'), ShareController.updateShare);
router.delete('/script/:id/:shareId', ShareController.removeShare);
router.delete('/script/:id', ShareController.removeAllShares);

// Rotas auxiliares
router.get('/users/search', validatePagination(), ShareController.searchUsers);
router.get('/script/:id/permissions', ShareController.checkSharePermissions);
router.get('/stats', ShareController.getShareStats);

// Rotas futuras (não implementadas)
router.post('/script/:id/email', ShareController.shareByEmail);
router.post('/script/:id/public-link', ShareController.generatePublicLink);

module.exports = router; 