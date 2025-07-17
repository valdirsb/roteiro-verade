const express = require('express');
const router = express.Router();
const CharacterController = require('../controllers/characterController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/authorization');
const { validateCharacter } = require('../utils/validation');
const { upload } = require('../middleware/upload');

/**
 * @swagger
 * tags:
 *   name: Personagens
 *   description: Endpoints para gerenciar os personagens dos roteiros
 */

/**
 * @swagger
 * /characters:
 *   get:
 *     summary: Lista todos os personagens
 *     tags: [Personagens]
 *     responses:
 *       '200':
 *         description: Lista de personagens
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Character'
 */
router.get('/', CharacterController.listCharacters);

/**
 * @swagger
 * /characters/{id}:
 *   get:
 *     summary: Obtém um personagem pelo ID
 *     tags: [Personagens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Detalhes do personagem
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Character'
 *       '404':
 *         description: Personagem não encontrado
 */
router.get('/:id', CharacterController.getCharacter);

/**
 * @swagger
 * /characters:
 *   post:
 *     summary: Cria um novo personagem (requer admin)
 *     tags: [Personagens]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               color:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '201':
 *         description: Personagem criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Character'
 *       '400':
 *         description: Erro de validação
 *       '403':
 *         description: Acesso negado
 */
router.post(
  '/',
  authenticateToken,
  requireRole(['admin']),
  upload.single('image'),
  validateCharacter('create'),
  CharacterController.createCharacter
);

/**
 * @swagger
 * /characters/{id}:
 *   put:
 *     summary: Atualiza um personagem (requer admin)
 *     tags: [Personagens]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               color:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '200':
 *         description: Personagem atualizado com sucesso
 *       '400':
 *         description: Erro de validação
 *       '403':
 *         description: Acesso negado
 *       '404':
 *         description: Personagem não encontrado
 */
router.put(
  '/:id',
  authenticateToken,
  requireRole('admin'),
  upload.single('image'),
  validateCharacter('update'),
  CharacterController.updateCharacter
);

/**
 * @swagger
 * /characters/{id}:
 *   delete:
 *     summary: Remove um personagem (requer admin)
 *     tags: [Personagens]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '204':
 *         description: Personagem removido com sucesso
 *       '403':
 *         description: Acesso negado
 *       '404':
 *         description: Personagem não encontrado
 */
router.delete(
  '/:id',
  authenticateToken,
  requireRole('admin'),
  CharacterController.deactivateCharacter
);

module.exports = router;
