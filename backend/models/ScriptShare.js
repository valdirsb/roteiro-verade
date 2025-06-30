const database = require('../config/database');
const logger = require('../utils/logger');

class ScriptShare {
  constructor(data = {}) {
    this.id = data.id;
    this.script_id = data.script_id;
    this.shared_by = data.shared_by;
    this.shared_with = data.shared_with;
    this.permission = data.permission || 'view';
    this.created_at = data.created_at;
    this.shared_by_name = data.shared_by_name;
    this.shared_with_name = data.shared_with_name;
    this.script_title = data.script_title;
  }

  // Buscar compartilhamento por ID
  static async findById(id) {
    try {
      const sql = `
        SELECT 
          ss.*,
          u1.username as shared_by_name,
          u2.username as shared_with_name,
          s.title as script_title
        FROM script_shares ss
        LEFT JOIN users u1 ON ss.shared_by = u1.id
        LEFT JOIN users u2 ON ss.shared_with = u2.id
        LEFT JOIN scripts s ON ss.script_id = s.id
        WHERE ss.id = ?
      `;
      
      const rows = await database.query(sql, [id]);
      return rows.length > 0 ? new ScriptShare(rows[0]) : null;
    } catch (error) {
      logger.error('Erro ao buscar compartilhamento por ID:', error);
      throw error;
    }
  }

  // Buscar compartilhamentos por roteiro
  static async findByScript(scriptId) {
    try {
      const sql = `
        SELECT 
          ss.*,
          u1.username as shared_by_name,
          u2.username as shared_with_name,
          s.title as script_title
        FROM script_shares ss
        LEFT JOIN users u1 ON ss.shared_by = u1.id
        LEFT JOIN users u2 ON ss.shared_with = u2.id
        LEFT JOIN scripts s ON ss.script_id = s.id
        WHERE ss.script_id = ?
        ORDER BY ss.created_at DESC
      `;
      
      const rows = await database.query(sql, [scriptId]);
      return rows.map(row => new ScriptShare(row));
    } catch (error) {
      logger.error('Erro ao buscar compartilhamentos por roteiro:', error);
      throw error;
    }
  }

  // Buscar compartilhamentos com usuário
  static async findByUser(userId) {
    try {
      const sql = `
        SELECT 
          ss.*,
          u1.username as shared_by_name,
          u2.username as shared_with_name,
          s.title as script_title
        FROM script_shares ss
        LEFT JOIN users u1 ON ss.shared_by = u1.id
        LEFT JOIN users u2 ON ss.shared_with = u2.id
        LEFT JOIN scripts s ON ss.script_id = s.id
        WHERE ss.shared_with = ?
        ORDER BY ss.created_at DESC
      `;
      
      const rows = await database.query(sql, [userId]);
      return rows.map(row => new ScriptShare(row));
    } catch (error) {
      logger.error('Erro ao buscar compartilhamentos com usuário:', error);
      throw error;
    }
  }

  // Verificar se roteiro está compartilhado com usuário
  static async checkShare(scriptId, userId) {
    try {
      const sql = `
        SELECT permission 
        FROM script_shares 
        WHERE script_id = ? AND shared_with = ?
      `;
      
      const rows = await database.query(sql, [scriptId, userId]);
      return rows.length > 0 ? rows[0].permission : null;
    } catch (error) {
      logger.error('Erro ao verificar compartilhamento:', error);
      throw error;
    }
  }

  // Criar compartilhamento
  static async create(shareData) {
    try {
      const { script_id, shared_by, shared_with, permission } = shareData;
      
      // Verificar se já existe compartilhamento
      const existingShare = await ScriptShare.checkShare(script_id, shared_with);
      if (existingShare) {
        throw new Error('Roteiro já está compartilhado com este usuário');
      }

      const sql = `
        INSERT INTO script_shares (script_id, shared_by, shared_with, permission)
        VALUES (?, ?, ?, ?)
      `;
      
      const result = await database.query(sql, [script_id, shared_by, shared_with, permission]);
      
      // Buscar compartilhamento criado
      const newShare = await ScriptShare.findById(result.insertId);
      logger.info(`Roteiro compartilhado: ${newShare.script_title} com ${newShare.shared_with_name}`);
      
      return newShare;
    } catch (error) {
      logger.error('Erro ao criar compartilhamento:', error);
      throw error;
    }
  }

  // Atualizar permissão de compartilhamento
  async update(updateData) {
    try {
      const { permission } = updateData;
      
      const sql = 'UPDATE script_shares SET permission = ? WHERE id = ?';
      await database.query(sql, [permission, this.id]);
      
      // Buscar compartilhamento atualizado
      const updatedShare = await ScriptShare.findById(this.id);
      logger.info(`Permissão atualizada: ${updatedShare.script_title} com ${updatedShare.shared_with_name}`);
      
      return updatedShare;
    } catch (error) {
      logger.error('Erro ao atualizar compartilhamento:', error);
      throw error;
    }
  }

  // Remover compartilhamento
  async delete() {
    try {
      const sql = 'DELETE FROM script_shares WHERE id = ?';
      await database.query(sql, [this.id]);
      
      logger.info(`Compartilhamento removido: ${this.script_title} com ${this.shared_with_name}`);
      
      return true;
    } catch (error) {
      logger.error('Erro ao remover compartilhamento:', error);
      throw error;
    }
  }

  // Remover todos os compartilhamentos de um roteiro
  static async deleteByScript(scriptId) {
    try {
      const sql = 'DELETE FROM script_shares WHERE script_id = ?';
      await database.query(sql, [scriptId]);
      
      logger.info(`Todos os compartilhamentos removidos do roteiro ${scriptId}`);
      
      return true;
    } catch (error) {
      logger.error('Erro ao remover compartilhamentos do roteiro:', error);
      throw error;
    }
  }

  // Remover todos os compartilhamentos com um usuário
  static async deleteByUser(userId) {
    try {
      const sql = 'DELETE FROM script_shares WHERE shared_with = ?';
      await database.query(sql, [userId]);
      
      logger.info(`Todos os compartilhamentos removidos do usuário ${userId}`);
      
      return true;
    } catch (error) {
      logger.error('Erro ao remover compartilhamentos do usuário:', error);
      throw error;
    }
  }

  // Buscar compartilhamentos com filtros
  static async findWithFilters(filters = {}) {
    try {
      const {
        script_id,
        shared_by,
        shared_with,
        permission,
        page = 1,
        limit = 10
      } = filters;

      const offset = (page - 1) * limit;
      
      let sql = `
        SELECT 
          ss.*,
          u1.username as shared_by_name,
          u2.username as shared_with_name,
          s.title as script_title
        FROM script_shares ss
        LEFT JOIN users u1 ON ss.shared_by = u1.id
        LEFT JOIN users u2 ON ss.shared_with = u2.id
        LEFT JOIN scripts s ON ss.script_id = s.id
        WHERE 1=1
      `;
      const params = [];

      if (script_id) {
        sql += ' AND ss.script_id = ?';
        params.push(script_id);
      }

      if (shared_by) {
        sql += ' AND ss.shared_by = ?';
        params.push(shared_by);
      }

      if (shared_with) {
        sql += ' AND ss.shared_with = ?';
        params.push(shared_with);
      }

      if (permission) {
        sql += ' AND ss.permission = ?';
        params.push(permission);
      }

      // Contar total
      const countSql = sql.replace('SELECT ss.*, u1.username as shared_by_name, u2.username as shared_with_name, s.title as script_title', 'SELECT COUNT(*) as total');
      const countResult = await database.query(countSql, params);
      const total = countResult[0].total;

      // Buscar dados paginados
      sql += ' ORDER BY ss.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const rows = await database.query(sql, params);
      const shares = rows.map(row => new ScriptShare(row));

      return {
        shares,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Erro ao buscar compartilhamentos com filtros:', error);
      throw error;
    }
  }

  // Obter estatísticas de compartilhamento
  static async getStats() {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_shares,
          COUNT(DISTINCT script_id) as shared_scripts,
          COUNT(DISTINCT shared_with) as unique_users,
          permission,
          COUNT(*) as permission_count
        FROM script_shares 
        GROUP BY permission
      `;
      
      const rows = await database.query(sql);
      
      const stats = {
        total_shares: 0,
        shared_scripts: 0,
        unique_users: 0,
        permissions: {}
      };

      rows.forEach(row => {
        stats.total_shares += row.total_shares;
        stats.shared_scripts = Math.max(stats.shared_scripts, row.shared_scripts);
        stats.unique_users = Math.max(stats.unique_users, row.unique_users);
        stats.permissions[row.permission] = row.permission_count;
      });

      return stats;
    } catch (error) {
      logger.error('Erro ao obter estatísticas de compartilhamento:', error);
      throw error;
    }
  }

  // Converter para objeto público
  toPublicObject() {
    return {
      id: this.id,
      script_id: this.script_id,
      shared_by: this.shared_by,
      shared_with: this.shared_with,
      permission: this.permission,
      created_at: this.created_at,
      shared_by_name: this.shared_by_name,
      shared_with_name: this.shared_with_name,
      script_title: this.script_title
    };
  }

  // Converter para objeto de resposta
  toResponseObject() {
    return this.toPublicObject();
  }

  // Converter para objeto simples
  toSimpleObject() {
    return {
      id: this.id,
      script_id: this.script_id,
      permission: this.permission,
      shared_by_name: this.shared_by_name,
      shared_with_name: this.shared_with_name,
      script_title: this.script_title,
      created_at: this.created_at
    };
  }
}

module.exports = ScriptShare; 