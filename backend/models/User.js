const bcrypt = require('bcryptjs');
const database = require('../config/database');
const logger = require('../utils/logger');

class User {
  constructor(data = {}) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.role = data.role || 'viewer';
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Criar hash da senha
  static async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Verificar senha
  async verifyPassword(password) {
    return await bcrypt.compare(password, this.password_hash);
  }

  // Buscar usuário por ID
  static async findById(id) {
    try {
      const sql = `
        SELECT id, username, email, password_hash, role, is_active, created_at, updated_at
        FROM users 
        WHERE id = ? AND is_active = TRUE
      `;
      const rows = await database.query(sql, [id]);
      return rows.length > 0 ? new User(rows[0]) : null;
    } catch (error) {
      logger.error('Erro ao buscar usuário por ID:', error);
      throw error;
    }
  }

  // Buscar usuário por username
  static async findByUsername(username) {
    try {
      const sql = `
        SELECT id, username, email, password_hash, role, is_active, created_at, updated_at
        FROM users 
        WHERE username = ? AND is_active = TRUE
      `;
      const rows = await database.query(sql, [username]);
      return rows.length > 0 ? new User(rows[0]) : null;
    } catch (error) {
      logger.error('Erro ao buscar usuário por username:', error);
      throw error;
    }
  }

  // Buscar usuário por email
  static async findByEmail(email) {
    try {
      const sql = `
        SELECT id, username, email, password_hash, role, is_active, created_at, updated_at
        FROM users 
        WHERE email = ? AND is_active = TRUE
      `;
      const rows = await database.query(sql, [email]);
      return rows.length > 0 ? new User(rows[0]) : null;
    } catch (error) {
      logger.error('Erro ao buscar usuário por email:', error);
      throw error;
    }
  }

  // Criar novo usuário
  static async create(userData) {
    try {
      const { username, email, password, role = 'viewer' } = userData;
      
      // Verificar se username ou email já existem
      const existingUser = await User.findByUsername(username) || await User.findByEmail(email);
      if (existingUser) {
        throw new Error('Username ou email já existe');
      }

      // Hash da senha
      const password_hash = await User.hashPassword(password);

      const sql = `
        INSERT INTO users (username, email, password_hash, role, is_active)
        VALUES (?, ?, ?, ?, TRUE)
      `;
      
      const result = await database.query(sql, [username, email, password_hash, role]);
      
      // Buscar usuário criado
      const newUser = await User.findById(result.insertId);
      logger.info(`Usuário criado: ${newUser.username} (ID: ${newUser.id})`);
      
      return newUser;
    } catch (error) {
      logger.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  // Atualizar usuário
  async update(updateData) {
    try {
      const { username, email, password, role, is_active } = updateData;
      const updates = [];
      const params = [];

      if (username !== undefined) {
        updates.push('username = ?');
        params.push(username);
      }

      if (email !== undefined) {
        updates.push('email = ?');
        params.push(email);
      }

      if (password !== undefined) {
        updates.push('password_hash = ?');
        params.push(await User.hashPassword(password));
      }

      if (role !== undefined) {
        updates.push('role = ?');
        params.push(role);
      }

      if (is_active !== undefined) {
        updates.push('is_active = ?');
        params.push(is_active);
      }

      if (updates.length === 0) {
        return this;
      }

      params.push(this.id);
      const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
      
      await database.query(sql, params);
      
      // Buscar usuário atualizado
      const updatedUser = await User.findById(this.id);
      logger.info(`Usuário atualizado: ${updatedUser.username} (ID: ${updatedUser.id})`);
      
      return updatedUser;
    } catch (error) {
      logger.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  // Desativar usuário (soft delete)
  async deactivate() {
    try {
      const sql = 'UPDATE users SET is_active = FALSE WHERE id = ?';
      await database.query(sql, [this.id]);
      
      logger.info(`Usuário desativado: ${this.username} (ID: ${this.id})`);
      this.is_active = false;
      
      return this;
    } catch (error) {
      logger.error('Erro ao desativar usuário:', error);
      throw error;
    }
  }

  // Listar usuários (com paginação)
  static async findAll(options = {}) {
    try {
      const { page = 1, limit = 10, role, is_active } = options;
      const offset = (page - 1) * limit;
      
      let sql = `
        SELECT id, username, email, role, is_active, created_at, updated_at
        FROM users
        WHERE 1=1
      `;
      const params = [];

      if (role !== undefined) {
        sql += ' AND role = ?';
        params.push(role);
      }

      if (is_active !== undefined) {
        sql += ' AND is_active = ?';
        params.push(is_active);
      }

      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const rows = await database.query(sql, params);
      const users = rows.map(row => new User(row));

      // Contar total de registros
      let countSql = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
      const countParams = [];

      if (role !== undefined) {
        countSql += ' AND role = ?';
        countParams.push(role);
      }

      if (is_active !== undefined) {
        countSql += ' AND is_active = ?';
        countParams.push(is_active);
      }

      const countResult = await database.query(countSql, countParams);
      const total = countResult[0].total;

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Erro ao listar usuários:', error);
      throw error;
    }
  }

  // Verificar se usuário tem permissão
  hasPermission(requiredRole) {
    const roleHierarchy = {
      'admin': 3,
      'editor': 2,
      'viewer': 1
    };

    const userLevel = roleHierarchy[this.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
  }

  // Verificar se é admin
  isAdmin() {
    return this.role === 'admin';
  }

  // Verificar se é editor ou admin
  isEditor() {
    return this.hasPermission('editor');
  }

  // Converter para objeto público (sem dados sensíveis)
  toPublicObject() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      role: this.role,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // Converter para objeto de resposta (sem password_hash)
  toResponseObject() {
    const obj = this.toPublicObject();
    delete obj.password_hash;
    
    // Converter role para roles (array) para compatibilidade com o frontend
    obj.roles = [obj.role];
    delete obj.role;
    
    return obj;
  }
}

module.exports = User; 