const express = require('express');
const router = express.Router();
const ShareController = require('../controllers/shareController');
const { authenticateToken } = require('../middleware/auth');
const { validateShare, validatePagination } = require('../utils/validation');

/**
 * @swagger
 * tags:
 *   name: Compartilhamento
 *   description: Endpoints para gerenciar o compartilhamento de roteiros
 */

// Todas as rotas de compartilhamento requerem autenticação
router.use(authenticateToken);

/**
 * @swagger
 * /shares/script/{id}:
 *   get:
 *     summary: Lista os compartilhamentos de um roteiro específico
 *     tags: [Compartilhamento]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '200':
 *         description: Lista de compartilhamentos
 */
router.get('/script/:id', validatePagination(), ShareController.listScriptShares);

/**
 * @swagger
 * /shares/user:
 *   get:
 *     summary: Lista os roteiros compartilhados com o usuário logado
 *     tags: [Compartilhamento]
 *     responses:
 *       '200':
 *         description: Lista de roteiros compartilhados
 */
router.get('/user', validatePagination(), ShareController.listUserShares);

/**
 * @swagger
 * /shares/script/{id}:
 *   post:
 *     summary: Compartilha um roteiro com outro usuário
 *     tags: [Compartilhamento]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: integer }
 *               permission: { type: string, enum: ['viewer', 'editor'] }
 *     responses:
 *       '201':
 *         description: Roteiro compartilhado com sucesso
 */
router.post('/script/:id', validateShare('share'), ShareController.shareScript);

/**
 * @swagger
 * /shares/script/{id}/{shareId}:
 *   put:
 *     summary: Atualiza a permissão de um compartilhamento
 *     tags: [Compartilhamento]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: shareId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permission: { type: string, enum: ['viewer', 'editor'] }
 *     responses:
 *       '200':
 *         description: Permissão atualizada
 */
router.put('/script/:id/:shareId', validateShare('update'), ShareController.updateShare);

/**
 * @swagger
 * /shares/script/{id}/{shareId}:
 *   delete:
 *     summary: Remove um compartilhamento específico
 *     tags: [Compartilhamento]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: shareId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '204':
 *         description: Compartilhamento removido
 */
router.delete('/script/:id/:shareId', ShareController.removeShare);

/**
 * @swagger
 * /shares/script/{id}:
 *   delete:
 *     summary: Remove todos os compartilhamentos de um roteiro
 *     tags: [Compartilhamento]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '204':
 *         description: Todos os compartilhamentos foram removidos
 */
router.delete('/script/:id', ShareController.removeAllShares);

/**
 * @swagger
 * /shares/users/search:
 *   get:
 *     summary: Busca usuários para compartilhar por nome ou email
 *     tags: [Compartilhamento]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       '200':
 *         description: Lista de usuários encontrados
 */
router.get('/users/search', validatePagination(), ShareController.searchUsers);

/**
 * @swagger
 * /shares/script/{id}/permissions:
 *   get:
 *     summary: Checa as permissões do usuário logado em um roteiro específico
 *     tags: [Compartilhamento]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '200':
 *         description: Permissões do usuário
 */
router.get('/script/:id/permissions', ShareController.checkSharePermissions);

/**
 * @swagger
 * /shares/stats:
 *   get:
 *     summary: Obtém estatísticas sobre compartilhamentos
 *     tags: [Compartilhamento]
 *     responses:
 *       '200':
 *         description: Estatísticas de compartilhamento
 */
router.get('/stats', ShareController.getShareStats);

// Rotas futuras (não implementadas)
router.post('/script/:id/email', ShareController.shareByEmail);
router.post('/script/:id/public-link', ShareController.generatePublicLink);

module.exports = router; 