const express = require('express');
const router = express.Router();

// Importar controlador e middlewares
const AuthController = require('../controllers/authController');
const { 
  authenticateToken, 
  requireAuth, 
  requireAdmin 
} = require('../middleware/auth');
const { validate } = require('../utils/validation');
const { userSchemas } = require('../utils/validation');

// Rotas públicas
router.post('/register', validate(userSchemas.register), AuthController.register);
router.post('/login', validate(userSchemas.login), AuthController.login);
router.post('/refresh', AuthController.refresh);

// Rotas protegidas
router.post('/logout', authenticateToken, requireAuth, AuthController.logout);
router.get('/profile', authenticateToken, requireAuth, AuthController.getProfile);
router.put('/profile', authenticateToken, requireAuth, validate(userSchemas.update), AuthController.updateProfile);
router.post('/change-password', authenticateToken, requireAuth, AuthController.changePassword);
router.get('/verify', authenticateToken, requireAuth, AuthController.verifyToken);

// Rotas administrativas
router.get('/users', authenticateToken, requireAdmin, AuthController.listUsers);
router.get('/users/:id', authenticateToken, requireAdmin, AuthController.getUserById);
router.put('/users/:id', authenticateToken, requireAdmin, validate(userSchemas.update), AuthController.updateUser);
router.delete('/users/:id', authenticateToken, requireAdmin, AuthController.deactivateUser);

module.exports = router; 