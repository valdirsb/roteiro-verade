const express = require('express');
const router = express.Router();
const ScriptController = require('../controllers/scriptController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/authorization');
const { validateScript, validateMessage, validatePagination, validateScriptFilters } = require('../utils/validation');

/**
 * @swagger
 * tags:
 *   - name: Roteiros
 *     description: Endpoints para criar e gerenciar roteiros
 *   - name: Mensagens de Roteiro
 *     description: Endpoints para gerenciar as mensagens dentro de um roteiro
 */

router.use(optionalAuth);

/**
 * @swagger
 * /scripts/recent:
 *   get:
 *     summary: Lista os roteiros atualizados mais recentemente
 *     tags: [Roteiros]
 *     responses:
 *       '200':
 *         description: Lista de roteiros recentes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Script'
 */
router.get('/recent', ScriptController.getRecentScripts);

/**
 * @swagger
 * /scripts:
 *   get:
 *     summary: Lista todos os roteiros públicos ou do usuário
 *     tags: [Roteiros]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       '200':
 *         description: Uma lista paginada de roteiros.
 */
router.get('/', validatePagination(), ScriptController.listScripts);

/**
 * @swagger
 * /scripts/public:
 *   get:
 *     summary: Lista todos os roteiros públicos
 *     tags: [Roteiros]
 *     responses:
 *       '200':
 *         description: Lista de roteiros públicos
 */
router.get('/public', validatePagination(), ScriptController.listScripts);

// Rotas protegidas
router.use(authenticateToken);

/**
 * @swagger
 * /scripts/{id}:
 *   get:
 *     summary: Obtém um roteiro específico pelo ID
 *     tags: [Roteiros]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '200':
 *         description: Detalhes do roteiro
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Script'
 *       '404':
 *         description: Roteiro não encontrado
 */
router.get('/:id', ScriptController.getScript);

/**
 * @swagger
 * /scripts/{id}/messages:
 *   get:
 *     summary: Lista as mensagens de um roteiro específico
 *     tags: [Mensagens de Roteiro]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '200':
 *         description: Lista de mensagens
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ScriptMessage'
 */
router.get('/:id/messages', validatePagination(), ScriptController.getScriptMessages);

/**
 * @swagger
 * /scripts/{id}/export:
 *   get:
 *     summary: 'Exporta um roteiro (formato a ser definido, ex: TXT, PDF)'
 *     tags: [Roteiros]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '200':
 *         description: Arquivo do roteiro exportado
 */
router.get('/:id/export', ScriptController.exportScript);


/**
 * @swagger
 * /scripts/user/scripts:
 *   get:
 *     summary: Lista os roteiros do usuário autenticado
 *     tags: [Roteiros]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de roteiros do usuário
 */
router.get('/user/scripts', validateScriptFilters(), ScriptController.listScripts);

/**
 * @swagger
 * /scripts/user/shared:
 *   get:
 *     summary: Lista roteiros compartilhados com o usuário
 *     tags: [Roteiros]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de roteiros compartilhados
 */
router.get('/user/shared', validatePagination(), ScriptController.listScripts);

/**
 * @swagger
 * /scripts:
 *   post:
 *     summary: Cria um novo roteiro
 *     tags: [Roteiros]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Script'
 *     responses:
 *       '201':
 *         description: Roteiro criado com sucesso
 */
router.post('/', validateScript('create'), ScriptController.createScript);

/**
 * @swagger
 * /scripts/{id}:
 *   put:
 *     summary: Atualiza um roteiro existente
 *     tags: [Roteiros]
 *     security:
 *       - bearerAuth: []
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
 *             $ref: '#/components/schemas/Script'
 *     responses:
 *       '200':
 *         description: Roteiro atualizado com sucesso
 */
router.put('/:id', validateScript('update'), ScriptController.updateScript);

/**
 * @swagger
 * /scripts/{id}:
 *   delete:
 *     summary: Remove um roteiro
 *     tags: [Roteiros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '204':
 *         description: Roteiro removido com sucesso
 */
router.delete('/:id', ScriptController.deleteScript);

/**
 * @swagger
 * /scripts/{id}/messages:
 *   post:
 *     summary: Adiciona uma nova mensagem a um roteiro
 *     tags: [Mensagens de Roteiro]
 *     security:
 *       - bearerAuth: []
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
 *             $ref: '#/components/schemas/ScriptMessage'
 *     responses:
 *       '201':
 *         description: Mensagem adicionada com sucesso
 */
router.post('/:id/messages', validateMessage('create'), ScriptController.addMessage);

/**
 * @swagger
 * /scripts/{id}/messages/{messageId}:
 *   put:
 *     summary: Atualiza uma mensagem existente
 *     tags: [Mensagens de Roteiro]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScriptMessage'
 *     responses:
 *       '200':
 *         description: Mensagem atualizada com sucesso
 */
router.put('/:id/messages/:messageId', validateMessage('update'), ScriptController.updateMessage);

/**
 * @swagger
 * /scripts/{id}/messages/{messageId}:
 *   delete:
 *     summary: Remove uma mensagem de um roteiro
 *     tags: [Mensagens de Roteiro]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '204':
 *         description: Mensagem removida com sucesso
 */
router.delete('/:id/messages/:messageId', ScriptController.deleteMessage);

/**
 * @swagger
 * /scripts/{id}/messages/reorder:
 *   post:
 *     summary: Reordena as mensagens de um roteiro
 *     tags: [Mensagens de Roteiro]
 *     security:
 *       - bearerAuth: []
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
 *               messages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id: { type: integer }
 *                     order: { type: integer }
 *     responses:
 *       '200':
 *         description: Mensagens reordenadas com sucesso
 */
router.post('/:id/messages/reorder', ScriptController.reorderMessages);

/**
 * @swagger
 * /scripts/{id}/stats:
 *   get:
 *     summary: Obtém estatísticas de um roteiro específico
 *     tags: [Roteiros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '200':
 *         description: Estatísticas do roteiro
 */
router.get('/:id/stats', ScriptController.getScriptStats);

module.exports = router; 