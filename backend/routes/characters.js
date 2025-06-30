const express = require('express');
const router = express.Router();
const CharacterController = require('../controllers/characterController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/authorization');
const { uploadCharacterAvatar, handleUploadError, validateUploadedFile } = require('../middleware/upload');
const { validateCharacter } = require('../utils/validation');

// Rotas públicas (não requerem autenticação)
router.get('/', CharacterController.listCharacters);
router.get('/popular', CharacterController.getPopularCharacters);
router.get('/script/:scriptId', CharacterController.getCharactersByScript);
router.get('/:id', CharacterController.getCharacter);
router.get('/name/:name/check', CharacterController.checkNameAvailability);

// Rotas protegidas (requerem autenticação)
router.use(authenticateToken);

// Rotas de administração (apenas admin)
router.get('/admin/all', requireRole(['admin']), CharacterController.listAllCharacters);
router.get('/admin/search', requireRole(['admin']), CharacterController.searchCharacters);
router.post('/', requireRole(['admin']), validateCharacter, CharacterController.createCharacter);
router.put('/:id', requireRole(['admin']), validateCharacter, CharacterController.updateCharacter);
router.delete('/:id', requireRole(['admin']), CharacterController.deactivateCharacter);
router.patch('/:id/activate', requireRole(['admin']), CharacterController.activateCharacter);

// Upload de avatar (apenas admin)
router.post('/:id/avatar', 
  requireRole(['admin']), 
  uploadCharacterAvatar, 
  handleUploadError,
  validateUploadedFile,
  CharacterController.uploadAvatar
);

// Estatísticas (apenas admin)
router.get('/:id/stats', requireRole(['admin']), CharacterController.getCharacterStats);

module.exports = router; 