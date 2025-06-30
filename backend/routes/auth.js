const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { validateUser } = require('../utils/validation');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Autenticação
 *   description: Endpoints para registro, login e gerenciamento de sessão
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       '201':
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       '400':
 *         description: Erro de validação ou usuário já existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', validateUser('register'), AuthController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Autentica um usuário e retorna tokens de acesso
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       '200':
 *         description: Login bem-sucedido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       '401':
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', validateUser('login'), AuthController.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Invalida o refresh token do usuário (logout)
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Logout bem-sucedido
 *       '401':
 *         description: Não autorizado
 */
router.post('/logout', authenticateToken, AuthController.logout);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Gera um novo token de acesso usando o refresh token
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Token atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *       '401':
 *         description: Refresh token inválido ou expirado
 */
router.post('/refresh', AuthController.refresh);

module.exports = router;