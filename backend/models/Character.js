const database = require('../config/database');
const logger = require('../utils/logger');

class Character {
  constructor(data = {}) {
    this.id = data.id;
    this.name = data.name;
    this.color = data.color || '#000000';
    this.avatar_url = data.avatar_url;
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.created_by = data.created_by;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Buscar personagem por ID
  static async findById(id) {
    try {
      const sql = `
        SELECT c.*, u.username as creator_name
        FROM characters c
        LEFT JOIN users u ON c.created_by = u.id
        WHERE c.id = ? AND c.is_active = TRUE
      `;
      const rows = await database.query(sql, [id]);
      return rows.length > 0 ? new Character(rows[0]) : null;
    } catch (error) {
      logger.error('Erro ao buscar personagem por ID:', error);
      throw error;
    }
  }

  // Buscar personagem por nome
  static async findByName(name) {
    try {
      const sql = `
        SELECT c.*, u.username as creator_name
        FROM characters c
        LEFT JOIN users u ON c.created_by = u.id
        WHERE c.name = ? AND c.is_active = TRUE
      `;
      const rows = await database.query(sql, [name]);
      return rows.length > 0 ? new Character(rows[0]) : null;
    } catch (error) {
      logger.error('Erro ao buscar personagem por nome:', error);
      throw error;
    }
  }

  // Listar todos os personagens ativos
  static async findAll(options = {}) {
    try {
      const { includeInactive = false, created_by } = options;
      
      let sql = `
        SELECT c.*, u.username as creator_name
        FROM characters c
        LEFT JOIN users u ON c.created_by = u.id
        WHERE 1=1
      `;
      const params = [];

      if (!includeInactive) {
        sql += ' AND c.is_active = TRUE';
      }

      if (created_by) {
        sql += ' AND c.created_by = ?';
        params.push(created_by);
      }

      sql += ' ORDER BY c.name ASC';

      const rows = await database.query(sql, params);
      return rows.map(row => new Character(row));
    } catch (error) {
      logger.error('Erro ao listar personagens:', error);
      throw error;
    }
  }

  // Criar novo personagem
  static async create(characterData) {
    try {
      const { name, color, avatar_url, created_by } = characterData;
      
      // Verificar se nome já existe
      const existingCharacter = await Character.findByName(name);
      if (existingCharacter) {
        throw new Error('Nome de personagem já existe');
      }

      const sql = `
        INSERT INTO characters (name, color, avatar_url, is_active, created_by)
        VALUES (?, ?, ?, TRUE, ?)
      `;
      
      const result = await database.query(sql, [name, color, avatar_url, created_by]);
      
      // Buscar personagem criado
      const newCharacter = await Character.findById(result.insertId);
      logger.info(`Personagem criado: ${newCharacter.name} (ID: ${newCharacter.id})`);
      
      return newCharacter;
    } catch (error) {
      logger.error('Erro ao criar personagem:', error);
      throw error;
    }
  }

  // Atualizar personagem
  async update(updateData) {
    try {
      const { name, color, avatar_url, is_active } = updateData;
      const updates = [];
      const params = [];

      if (name !== undefined) {
        // Verificar se nome já existe (exceto para este personagem)
        const existingCharacter = await Character.findByName(name);
        if (existingCharacter && existingCharacter.id !== this.id) {
          throw new Error('Nome de personagem já existe');
        }
        
        updates.push('name = ?');
        params.push(name);
      }

      if (color !== undefined) {
        updates.push('color = ?');
        params.push(color);
      }

      if (avatar_url !== undefined) {
        updates.push('avatar_url = ?');
        params.push(avatar_url);
      }

      if (is_active !== undefined) {
        updates.push('is_active = ?');
        // Converter para inteiro para garantir compatibilidade com MySQL tinyint(1)
        params.push(is_active ? 1 : 0);
      }

      if (updates.length === 0) {
        return this;
      }

      params.push(this.id);
      const sql = `UPDATE characters SET ${updates.join(', ')} WHERE id = ?`;
      
      await database.query(sql, params);
      
      // Buscar personagem atualizado
      const updatedCharacter = await Character.findById(this.id);
      logger.info(`Personagem atualizado: ${updatedCharacter.name} (ID: ${updatedCharacter.id})`);
      
      return updatedCharacter;
    } catch (error) {
      logger.error('Erro ao atualizar personagem:', error);
      throw error;
    }
  }

  // Desativar personagem (soft delete)
  async deactivate() {
    try {
      const sql = 'UPDATE characters SET is_active = FALSE WHERE id = ?';
      await database.query(sql, [this.id]);
      
      logger.info(`Personagem desativado: ${this.name} (ID: ${this.id})`);
      this.is_active = false;
      
      return this;
    } catch (error) {
      logger.error('Erro ao desativar personagem:', error);
      throw error;
    }
  }

  // Ativar personagem
  async activate() {
    try {
      const sql = 'UPDATE characters SET is_active = TRUE WHERE id = ?';
      await database.query(sql, [this.id]);
      
      logger.info(`Personagem ativado: ${this.name} (ID: ${this.id})`);
      this.is_active = true;
      
      return this;
    } catch (error) {
      logger.error('Erro ao ativar personagem:', error);
      throw error;
    }
  }

  // Verificar se personagem está sendo usado em roteiros
  async isUsedInScripts() {
    try {
      const sql = `
        SELECT COUNT(*) as count 
        FROM script_messages 
        WHERE character_id = ?
      `;
      const result = await database.query(sql, [this.id]);
      return result[0].count > 0;
    } catch (error) {
      logger.error('Erro ao verificar uso do personagem:', error);
      throw error;
    }
  }

  // Obter estatísticas de uso
  async getUsageStats() {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_messages,
          COUNT(DISTINCT script_id) as total_scripts
        FROM script_messages 
        WHERE character_id = ?
      `;
      const result = await database.query(sql, [this.id]);
      return result[0];
    } catch (error) {
      logger.error('Erro ao obter estatísticas do personagem:', error);
      throw error;
    }
  }

  // Buscar personagens por roteiro
  static async findByScript(scriptId) {
    try {
      const sql = `
        SELECT DISTINCT c.*, u.username as creator_name
        FROM characters c
        LEFT JOIN users u ON c.created_by = u.id
        INNER JOIN script_messages sm ON c.id = sm.character_id
        WHERE sm.script_id = ? AND c.is_active = TRUE
        ORDER BY c.name ASC
      `;
      const rows = await database.query(sql, [scriptId]);
      return rows.map(row => new Character(row));
    } catch (error) {
      logger.error('Erro ao buscar personagens por roteiro:', error);
      throw error;
    }
  }

  // Buscar personagens populares (mais usados)
  static async findPopular(limit = 10) {
    try {
      const sql = `
        SELECT 
          c.*,
          u.username as creator_name,
          COUNT(sm.id) as usage_count
        FROM characters c
        LEFT JOIN users u ON c.created_by = u.id
        LEFT JOIN script_messages sm ON c.id = sm.character_id
        WHERE c.is_active = TRUE
        GROUP BY c.id
        ORDER BY usage_count DESC, c.name ASC
        LIMIT ?
      `;
      const rows = await database.query(sql, [limit]);
      return rows.map(row => new Character(row));
    } catch (error) {
      logger.error('Erro ao buscar personagens populares:', error);
      throw error;
    }
  }

  // Buscar personagens com filtros
  static async findWithFilters(filters = {}) {
    try {
      const {
        search,
        color,
        created_by,
        is_active,
        page = 1,
        limit = 10
      } = filters;

      console.log("FILTERS:", filters );

      // Garantir que page e limit sejam números inteiros válidos
      const safePage = Math.max(1, parseInt(page) || 1);
      const safeLimit = Math.max(1, Math.min(100, parseInt(limit) || 10)); // Máximo 100 por página
      const safeOffset = (safePage - 1) * safeLimit;
      
      const whereClauses = [];
      const params = [];

      if (search) {
        whereClauses.push('c.name LIKE ?');
        params.push(`%${search}%`);
      }

      if (color) {
        whereClauses.push('c.color = ?');
        params.push(color);
      }

      if (created_by) {
        whereClauses.push('c.created_by = ?');
        params.push(created_by);
      }

      if (is_active !== undefined && is_active !== null) {
        whereClauses.push('c.is_active = ?');
        // Converter para inteiro para garantir compatibilidade com MySQL tinyint(1)
        params.push(is_active ? 1 : 0);
      }
      
      const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      // Contar total
      const countSql = `
        SELECT COUNT(*) as total
        FROM characters c
        ${whereSql}
      `;
      
      const countResult = await database.query(countSql, params);
      const total = countResult[0].total;
      
      // Buscar dados paginados
      const dataSql = `
        SELECT c.*, u.username as creator_name
        FROM characters c
        LEFT JOIN users u ON c.created_by = u.id
        ${whereSql}
        ORDER BY c.name ASC
        LIMIT ${safeLimit} OFFSET ${safeOffset}
      `;

      console.log("dataSql: ", dataSql);
      console.log("dataParams: ", params);
      const rows = await database.query(dataSql, params);
      const characters = rows.map(row => new Character(row));

      return {
        characters,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Erro ao buscar personagens com filtros:', {
        service: 'roteiro-verade-backend',
        ...error
      });
      throw error;
    }
  }

  // Converter para objeto público
  toPublicObject() {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
      avatar_url: this.avatar_url,
      is_active: this.is_active,
      created_by: this.created_by,
      creator_name: this.creator_name,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // Converter para objeto de resposta
  toResponseObject() {
    return this.toPublicObject();
  }

  // Converter para objeto simples (sem dados sensíveis)
  toSimpleObject() {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
      avatar_url: this.avatar_url
    };
  }
}

module.exports = Character; 