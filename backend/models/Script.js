const database = require('../config/database');
const logger = require('../utils/logger');

class Script {
  constructor(data = {}) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.is_public = data.is_public !== undefined ? data.is_public : false;
    this.created_by = data.created_by;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.creator_name = data.creator_name;
    this.message_count = data.message_count || 0;
    this.character_count = data.character_count || 0;
  }

  // Buscar roteiro por ID
  static async findById(id, options = {}) {
    try {
      const { includeMessages = false, includeCharacters = false } = options;
      
      let sql = `
        SELECT s.*, u.username as creator_name
        FROM scripts s
        LEFT JOIN users u ON s.created_by = u.id
        WHERE s.id = ?
      `;
      
      const result = await database.query(sql, [id]);
      
      if (result.length === 0) {
        return null;
      }

      const script = new Script(result[0]);

      // Incluir mensagens se solicitado
      if (includeMessages) {
        script.messages = await this.getMessages(id);
      }

      // Incluir personagens se solicitado
      if (includeCharacters) {
        script.characters = await this.getCharacters(id);
      }

      return script;
    } catch (error) {
      logger.error('Erro ao buscar roteiro por ID:', error);
      throw error;
    }
  }

  // Listar roteiros com filtros
  static async findAll(filters = {}) {
    try {
      const {
        search,
        is_public,
        created_by,
        page = 1,
        limit = 10,
        sort_by = 'created_at',
        sort_order = 'desc'
      } = filters;

      // Garantir que page e limit sejam números inteiros válidos
      const safePage = Math.max(1, parseInt(page) || 1);
      const safeLimit = Math.max(1, Math.min(100, parseInt(limit) || 10)); // Máximo 100 por página
      const safeOffset = (safePage - 1) * safeLimit;

      // Debug: log dos valores


      console.log('DEBUG - Valores processados:', {
        safePage,
        safeLimit,
        safeOffset
      });

      // Montar filtros SQL
      let whereSql = 'WHERE 1=1';
      const params = [];
      const countParams = [];

      if (search) {
        whereSql += ' AND (s.title LIKE ? OR s.description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
        countParams.push(`%${search}%`, `%${search}%`);
      }

      if (is_public !== undefined && is_public !== null) {
        whereSql += ' AND s.is_public = ?';
        const intValue = is_public ? 1 : 0;
        params.push(intValue);
        countParams.push(intValue);

      }

      if (created_by) {
        whereSql += ' AND s.created_by = ?';
        const userId = parseInt(created_by);
        params.push(userId);
        countParams.push(userId);

      }

      // Query de contagem (sem GROUP BY, sem joins desnecessários)
      const countSql = `SELECT COUNT(DISTINCT s.id) as total FROM scripts s ${whereSql}`;
      const countResult = await database.query(countSql, countParams);
      const total = parseInt(countResult[0]?.total) || 0;

      // Query de listagem
      let sql = `
        SELECT 
          s.*,
          u.username as creator_name,
          COUNT(sm.id) as message_count,
          COUNT(DISTINCT sm.character_id) as character_count
        FROM scripts s
        LEFT JOIN users u ON s.created_by = u.id
        LEFT JOIN script_messages sm ON s.id = sm.script_id
        ${whereSql}
        GROUP BY s.id
      `;

      // Ordenação
      const allowedSortFields = ['title', 'created_at', 'updated_at', 'message_count'];
      const allowedSortOrders = ['asc', 'desc'];
      const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'created_at';
      const sortOrder = allowedSortOrders.includes(sort_order) ? sort_order : 'desc';
      sql += ` ORDER BY ${sortField} ${sortOrder.toUpperCase()} LIMIT ${safeLimit} OFFSET ${safeOffset}`;



      const rows = await database.query(sql, params);
      const scripts = rows.map(row => new Script(row));

      return {
        scripts,
        pagination: {
          page: safePage,
          limit: safeLimit,
          total,
          pages: Math.ceil(total / safeLimit)
        }
      };
    } catch (error) {
      console.error('Erro ao listar roteiros:', error);
      logger.error('Erro ao listar roteiros:', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  // Criar novo roteiro
  static async create(scriptData) {
    try {
      const { title, description, is_public, created_by } = scriptData;
      
      const sql = `
        INSERT INTO scripts (title, description, is_public, created_by)
        VALUES (?, ?, ?, ?)
      `;
      
      const result = await database.query(sql, [title, description, is_public, created_by]);
      
      // Buscar roteiro criado
      const newScript = await Script.findById(result.insertId);
      logger.info(`Roteiro criado por ${scriptData.creator_name}: ${newScript.title} (ID: ${newScript.id})`);
      
      return newScript;
    } catch (error) {
      logger.error('Erro ao criar roteiro:', error);
      throw error;
    }
  }

  // Atualizar roteiro
  async update(updateData) {
    try {
      const { title, description, is_public } = updateData;
      const updates = [];
      const params = [];

      if (title !== undefined) {
        updates.push('title = ?');
        params.push(title);
      }

      if (description !== undefined) {
        updates.push('description = ?');
        params.push(description);
      }

      if (is_public !== undefined) {
        updates.push('is_public = ?');
        // Converter para inteiro para garantir compatibilidade com MySQL tinyint(1)
        params.push(is_public ? 1 : 0);
      }

      if (updates.length === 0) {
        return this;
      }

      params.push(this.id);
      const sql = `UPDATE scripts SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      
      await database.query(sql, params);
      
      // Buscar roteiro atualizado
      const updatedScript = await Script.findById(this.id);
      logger.info(`Roteiro atualizado: ${updatedScript.title} (ID: ${updatedScript.id})`);
      
      return updatedScript;
    } catch (error) {
      logger.error('Erro ao atualizar roteiro:', error);
      throw error;
    }
  }

  // Excluir roteiro
  async delete() {
    try {
      // Verificar se há mensagens
      const messageCount = await this.getMessageCount();
      if (messageCount > 0) {
        throw new Error('Não é possível excluir um roteiro que possui mensagens');
      }

      const sql = 'DELETE FROM scripts WHERE id = ?';
      await database.query(sql, [this.id]);
      
      logger.info(`Roteiro excluído: ${this.title} (ID: ${this.id})`);
      
      return true;
    } catch (error) {
      logger.error('Erro ao excluir roteiro:', error);
      throw error;
    }
  }

  // Obter mensagens do roteiro
  static async getMessages(scriptId) {
    try {
      const sql = `
        SELECT 
          sm.*,
          c.name as character_name,
          c.color as character_color,
          c.avatar_url as character_avatar
        FROM script_messages sm
        LEFT JOIN characters c ON sm.character_id = c.id
        WHERE sm.script_id = ?
        ORDER BY sm.order_index ASC, sm.created_at ASC
      `;
      
      const rows = await database.query(sql, [scriptId]);
      return rows;
    } catch (error) {
      logger.error('Erro ao obter mensagens do roteiro:', error);
      throw error;
    }
  }

  // Obter personagens do roteiro
  static async getCharacters(scriptId) {
    try {
      const sql = `
        SELECT DISTINCT 
          c.*,
          COUNT(sm.id) as message_count
        FROM characters c
        INNER JOIN script_messages sm ON c.id = sm.character_id
        WHERE sm.script_id = ? AND c.is_active = TRUE
        GROUP BY c.id
        ORDER BY message_count DESC, c.name ASC
      `;
      
      const rows = await database.query(sql, [scriptId]);
      return rows;
    } catch (error) {
      logger.error('Erro ao obter personagens do roteiro:', error);
      throw error;
    }
  }

  // Contar mensagens do roteiro
  async getMessageCount() {
    try {
      const sql = 'SELECT COUNT(*) as count FROM script_messages WHERE script_id = ?';
      const result = await database.query(sql, [this.id]);
      return result[0].count;
    } catch (error) {
      logger.error('Erro ao contar mensagens do roteiro:', error);
      throw error;
    }
  }

  // Contar personagens do roteiro
  async getCharacterCount() {
    try {
      const sql = `
        SELECT COUNT(DISTINCT character_id) as count 
        FROM script_messages 
        WHERE script_id = ?
      `;
      const result = await database.query(sql, [this.id]);
      return result[0].count;
    } catch (error) {
      logger.error('Erro ao contar personagens do roteiro:', error);
      throw error;
    }
  }

  // Buscar roteiros públicos
  static async findPublic(filters = {}) {
    const publicFilters = { ...filters, is_public: true };
    return await Script.findAll(publicFilters);
  }

  // Buscar roteiros do usuário
  static async findByUser(userId, filters = {}) {
    const userFilters = { ...filters, created_by: userId };
    return await Script.findAll(userFilters);
  }

  // Buscar roteiros compartilhados com usuário
  static async findSharedWithUser(userId, filters = {}) {
    try {
      const {
        search,
        page = 1,
        limit = 10,
        sort_by = 'created_at',
        sort_order = 'desc'
      } = filters;

      // Garantir que page e limit sejam números inteiros válidos
      const safePage = Math.max(1, parseInt(page) || 1);
      const safeLimit = Math.max(1, Math.min(100, parseInt(limit) || 10)); // Máximo 100 por página
      const safeOffset = (safePage - 1) * safeLimit;

      // Montar filtros SQL
      let whereSql = 'WHERE ss.shared_with = ?';
      const params = [parseInt(userId)];
      const countParams = [parseInt(userId)];

      if (search) {
        whereSql += ' AND (s.title LIKE ? OR s.description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
        countParams.push(`%${search}%`, `%${search}%`);
      }

      // Query de contagem (sem GROUP BY, sem joins desnecessários)
      const countSql = `SELECT COUNT(DISTINCT s.id) as total FROM scripts s INNER JOIN script_shares ss ON s.id = ss.script_id ${whereSql}`;
      const countResult = await database.query(countSql, countParams);
      const total = parseInt(countResult[0]?.total) || 0;

      // Query de listagem
      let sql = `
        SELECT 
          s.*,
          u.username as creator_name,
          COUNT(sm.id) as message_count,
          COUNT(DISTINCT sm.character_id) as character_count
        FROM scripts s
        INNER JOIN script_shares ss ON s.id = ss.script_id
        LEFT JOIN users u ON s.created_by = u.id
        LEFT JOIN script_messages sm ON s.id = sm.script_id
        ${whereSql}
        GROUP BY s.id
      `;

      // Ordenação
      const allowedSortFields = ['title', 'created_at', 'updated_at', 'message_count'];
      const allowedSortOrders = ['asc', 'desc'];
      const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'created_at';
      const sortOrder = allowedSortOrders.includes(sort_order) ? sort_order : 'desc';
      sql += ` ORDER BY ${sortField} ${sortOrder.toUpperCase()} LIMIT ${safeLimit} OFFSET ${safeOffset}`;

      const rows = await database.query(sql, params);
      const scripts = rows.map(row => new Script(row));

      return {
        scripts,
        pagination: {
          page: safePage,
          limit: safeLimit,
          total,
          pages: Math.ceil(total / safeLimit)
        }
      };
    } catch (error) {
      logger.error('Erro ao buscar roteiros compartilhados:', error);
      throw error;
    }
  }

  // Verificar permissões do usuário
  async checkUserPermission(userId) {
    try {
      // Se o usuário é o criador, tem todas as permissões
      if (this.created_by === userId) {
        return { can_view: true, can_edit: true, can_delete: true };
      }

      // Verificar se o roteiro é público
      if (this.is_public) {
        return { can_view: true, can_edit: false, can_delete: false };
      }

      // Verificar compartilhamento
      const sql = `
        SELECT permission 
        FROM script_shares 
        WHERE script_id = ? AND shared_with = ?
      `;
      const result = await database.query(sql, [this.id, userId]);
      
      if (result.length === 0) {
        return { can_view: false, can_edit: false, can_delete: false };
      }

      const permission = result[0].permission;
      return {
        can_view: true,
        can_edit: permission === 'edit',
        can_delete: false
      };
    } catch (error) {
      logger.error('Erro ao verificar permissões:', error);
      throw error;
    }
  }

  // Obter estatísticas do roteiro
  async getStats() {
    try {
      const messageCount = await this.getMessageCount();
      const characterCount = await this.getCharacterCount();
      
      // Calcular duração estimada (baseada em palavras)
      const sql = `
        SELECT SUM(LENGTH(message) - LENGTH(REPLACE(message, ' ', '')) + 1) as total_words
        FROM script_messages 
        WHERE script_id = ?
      `;
      const result = await database.query(sql, [this.id]);
      const totalWords = result[0].total_words || 0;
      
      // Estimativa: 150 palavras por minuto
      const estimatedDuration = Math.ceil(totalWords / 150);

      return {
        message_count: messageCount,
        character_count: characterCount,
        total_words: totalWords,
        estimated_duration_minutes: estimatedDuration
      };
    } catch (error) {
      logger.error('Erro ao obter estatísticas do roteiro:', error);
      throw error;
    }
  }

  // Converter para objeto público
  toPublicObject() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      is_public: this.is_public,
      created_by: this.created_by,
      creator_name: this.creator_name,
      created_at: this.created_at,
      updated_at: this.updated_at,
      message_count: this.message_count,
      character_count: this.character_count
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
      title: this.title,
      description: this.description,
      is_public: this.is_public,
      creator_name: this.creator_name,
      created_at: this.created_at,
      message_count: this.message_count,
      character_count: this.character_count
    };
  }

  /**
   * Consulta unificada de roteiros relevantes para um usuário.
   *
   * Retorna todos os roteiros que:
   *   - Foram criados pelo usuário (privados ou públicos)
   *   - São públicos e criados por outros usuários
   *   - Foram compartilhados com o usuário (exceto os que ele mesmo criou)
   *
   * Aplica filtros globais de busca, ordenação e paginação sobre o conjunto total, sem duplicidade.
   *
   * @param {number} userId - ID do usuário autenticado
   * @param {Object} filters - Filtros e opções de paginação/ordenação
   * @param {string} [filters.search] - Texto para busca em título/descrição
   * @param {number} [filters.page=1] - Página (1-based)
   * @param {number} [filters.limit=10] - Limite de itens por página
   * @param {string} [filters.sort_by='created_at'] - Campo de ordenação global (title, created_at, updated_at, message_count, character_count)
   * @param {string} [filters.sort_order='desc'] - Ordem (asc|desc)
   * @returns {Promise<{scripts: Script[], pagination: {page: number, limit: number, total: number, pages: number}}>} Lista paginada de roteiros e metadados de paginação
   *
   * Observações:
   * - A consulta utiliza UNION para garantir ausência de duplicidade.
   * - LIMIT/OFFSET são interpolados diretamente no SQL por compatibilidade com MySQL.
   * - Para grandes volumes, monitore o desempenho e avalie índices nas colunas mais filtradas/ordenadas.
   */
  static async findAllForUser(userId, filters = {}) {
    try {
      const {
        search,
        page = 1,
        limit = 10,
        sort_by = 'created_at',
        sort_order = 'desc'
      } = filters;

      const safePage = Math.max(1, parseInt(page) || 1);
      const safeLimit = Math.max(1, Math.min(100, parseInt(limit) || 10));
      const safeOffset = (safePage - 1) * safeLimit;

      // Campos de ordenação permitidos
      const allowedSortFields = ['title', 'created_at', 'updated_at', 'message_count', 'character_count'];
      const allowedSortOrders = ['asc', 'desc'];
      const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'created_at';
      const sortOrder = allowedSortOrders.includes(sort_order.toLowerCase()) ? sort_order : 'desc';

      // Montar SQL e parâmetros para cada bloco do UNION
      const selectCols = 's.id, s.title, s.description, s.is_public, s.created_by, s.created_at, s.updated_at, u.username as creator_name';
      let unionSql = '';
      let unionParams = [];

      // 1. Meus roteiros
      unionSql += `SELECT ${selectCols} FROM scripts s LEFT JOIN users u ON s.created_by = u.id WHERE s.created_by = ?`;
      unionParams.push(userId);
      if (search) {
        unionSql += ' AND (s.title LIKE ? OR s.description LIKE ?)';
        unionParams.push(`%${search}%`, `%${search}%`);
      }

      // 2. Roteiros públicos de outros usuários
      unionSql += ` UNION SELECT ${selectCols} FROM scripts s LEFT JOIN users u ON s.created_by = u.id WHERE s.is_public = 1 AND s.created_by != ?`;
      unionParams.push(userId);
      if (search) {
        unionSql += ' AND (s.title LIKE ? OR s.description LIKE ?)';
        unionParams.push(`%${search}%`, `%${search}%`);
      }

      // 3. Roteiros compartilhados comigo (exceto os que já são meus)
      unionSql += ` UNION SELECT ${selectCols} FROM scripts s INNER JOIN script_shares ss ON s.id = ss.script_id LEFT JOIN users u ON s.created_by = u.id WHERE ss.shared_with = ? AND s.created_by != ?`;
      unionParams.push(userId, userId);
      if (search) {
        unionSql += ' AND (s.title LIKE ? OR s.description LIKE ?)';
        unionParams.push(`%${search}%`, `%${search}%`);
      }

      // Envolver o UNION em uma subquery para aplicar ordenação, paginação e agregações
      let finalSql = `
        SELECT sq.*, 
          (SELECT COUNT(sm.id) FROM script_messages sm WHERE sm.script_id = sq.id) as message_count,
          (SELECT COUNT(DISTINCT sm.character_id) FROM script_messages sm WHERE sm.script_id = sq.id) as character_count
        FROM (
          ${unionSql}
        ) sq
        ORDER BY sq.${sortField} ${sortOrder.toUpperCase()}
        LIMIT ${safeLimit} OFFSET ${safeOffset}
      `;
      // unionParams.push(safeLimit, safeOffset); // Remover esses parâmetros

      // Query de contagem total
      let countSql = `
        SELECT COUNT(DISTINCT sq.id) as total
        FROM (
          ${unionSql}
        ) sq
      `;
      const countParams = unionParams; // Todos os params exceto limit/offset

      // Log para depuração
      logger.info('SQL final findAllForUser', { sql: finalSql, params: unionParams });
      logger.info('SQL count findAllForUser', { sql: countSql, params: countParams });

      // Execução
      const [rows, countResult] = await Promise.all([
        database.query(finalSql, unionParams),
        database.query(countSql, countParams)
      ]);
      const total = parseInt(countResult[0]?.total) || 0;
      const scripts = rows.map(row => new Script(row));

      return {
        scripts,
        pagination: {
          page: safePage,
          limit: safeLimit,
          total,
          pages: Math.ceil(total / safeLimit)
        }
      };
    } catch (error) {
      logger.error('Erro ao buscar roteiros unificados para usuário:', error);
      throw error;
    }
  }
}

module.exports = Script; 