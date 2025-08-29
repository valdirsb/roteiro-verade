const database = require('../config/database');
const logger = require('../utils/logger');

class ScriptMessage {
  constructor(data = {}) {
    this.id = data.id;
    this.script_id = data.script_id;
    this.character_id = data.character_id;
    this.message = data.message;
    this.order_index = data.order_index || 0;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.character_name = data.character_name;
    this.character_color = data.character_color;
    this.character_avatar = data.character_avatar;
  }

  // Buscar mensagem por ID
  static async findById(id) {
    try {
      const sql = `
        SELECT 
          sm.*,
          c.name as character_name,
          c.color as character_color,
          c.avatar_url as character_avatar
        FROM script_messages sm
        LEFT JOIN characters c ON sm.character_id = c.id
        WHERE sm.id = ?
      `;
      
      const rows = await database.query(sql, [id]);
      return rows.length > 0 ? new ScriptMessage(rows[0]) : null;
    } catch (error) {
      logger.error('Erro ao buscar mensagem por ID:', error);
      throw error;
    }
  }

  // Buscar mensagens por roteiro
  static async findByScript(scriptId, options = {}) {
    try {
      const { 
        page, 
        limit, 
        character_id,
        order_by = 'order_index',
        order_direction = 'ASC'
      } = options;

      let sql = `
        SELECT 
          sm.*,
          c.name as character_name,
          c.color as character_color,
          c.avatar_url as character_avatar
        FROM script_messages sm
        LEFT JOIN characters c ON sm.character_id = c.id
        WHERE sm.script_id = ?
      `;
      const params = [scriptId];

      if (character_id) {
        sql += ' AND sm.character_id = ?';
        params.push(character_id);
      }

      // Ordenação
      const allowedOrderFields = ['order_index', 'created_at', 'id'];
      const allowedDirections = ['ASC', 'DESC'];
      
      const orderField = allowedOrderFields.includes(order_by) ? order_by : 'order_index';
      const orderDir = allowedDirections.includes(order_direction.toUpperCase()) ? order_direction.toUpperCase() : 'ASC';
      
      sql += ` ORDER BY ${orderField} ${orderDir}`;

      // Paginação
      const safePage = parseInt(page, 10);
      const safeLimit = parseInt(limit, 10);
      const finalPage = Number.isFinite(safePage) && safePage > 0 ? safePage : 1;
      const finalLimit = Number.isFinite(safeLimit) && safeLimit > 0 ? safeLimit : 10;
      const offset = (finalPage - 1) * finalLimit;
      // Interpolação direta de LIMIT/OFFSET
      sql += ` LIMIT ${finalLimit} OFFSET ${offset}`;

      const rows = await database.query(sql, params);
      return rows.map(row => new ScriptMessage(row));
    } catch (error) {
      logger.error('Erro ao buscar mensagens por roteiro:', error);
      throw error;
    }
  }

  // Criar nova mensagem
  static async create(messageData) {
    try {
      const { script_id, character_id, message, order_index } = messageData;
      
      // Se não foi especificado order_index, pegar o próximo
      let finalOrderIndex = order_index;
      if (finalOrderIndex === undefined || finalOrderIndex === null) {
        const maxOrderSql = 'SELECT COALESCE(MAX(order_index), -1) + 1 as next_order FROM script_messages WHERE script_id = ?';
        const maxOrderResult = await database.query(maxOrderSql, [script_id]);
        finalOrderIndex = maxOrderResult[0].next_order;
      }

      const sql = `
        INSERT INTO script_messages (script_id, character_id, message, order_index)
        VALUES (?, ?, ?, ?)
      `;
      
      const result = await database.query(sql, [script_id, character_id, message, finalOrderIndex]);
      
      // Buscar mensagem criada
      const newMessage = await ScriptMessage.findById(result.insertId);
      logger.info(`Mensagem criada no roteiro ${script_id}: ${newMessage.message.substring(0, 50)}...`);
      
      return newMessage;
    } catch (error) {
      logger.error('Erro ao criar mensagem:', error);
      throw error;
    }
  }

  // Atualizar mensagem
  async update(updateData) {
    try {
      const { character_id, message, order_index } = updateData;
      const updates = [];
      const params = [];

      if (character_id !== undefined) {
        updates.push('character_id = ?');
        params.push(character_id);
      }

      if (message !== undefined) {
        updates.push('message = ?');
        params.push(message);
      }

      if (order_index !== undefined) {
        updates.push('order_index = ?');
        params.push(order_index);
      }

      if (updates.length === 0) {
        return this;
      }

      params.push(this.id);
      const sql = `UPDATE script_messages SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      
      await database.query(sql, params);
      
      // Buscar mensagem atualizada
      const updatedMessage = await ScriptMessage.findById(this.id);
      logger.info(`Mensagem atualizada: ${updatedMessage.message.substring(0, 50)}...`);
      
      return updatedMessage;
    } catch (error) {
      logger.error('Erro ao atualizar mensagem:', error);
      throw error;
    }
  }

  // Excluir mensagem
  async delete() {
    try {
      const sql = 'DELETE FROM script_messages WHERE id = ?';
      await database.query(sql, [this.id]);
      
      logger.info(`Mensagem excluída: ${this.message.substring(0, 50)}...`);
      
      return true;
    } catch (error) {
      logger.error('Erro ao excluir mensagem:', error);
      throw error;
    }
  }

  // Reordenar mensagens
  static async reorderMessages(scriptId, messageIds) {
    try {
      await database.transaction(async (connection) => {
        // 1. Atualize todos para um valor temporário negativo
        for (let i = 0; i < messageIds.length; i++) {
          await connection.execute(
            'UPDATE script_messages SET order_index = ? WHERE id = ? AND script_id = ?',
            [-(i + 1), messageIds[i], scriptId]
          );
        }
        // 2. Atualize para o valor final
        for (let i = 0; i < messageIds.length; i++) {
          await connection.execute(
            'UPDATE script_messages SET order_index = ? WHERE id = ? AND script_id = ?',
            [i, messageIds[i], scriptId]
          );
        }
      });
      logger.info(`Mensagens reordenadas no roteiro ${scriptId}`);
      return true;
    } catch (error) {
      logger.error('Erro ao reordenar mensagens:', error);
      throw error;
    }
  }

  // Mover mensagem para posição específica
  static async moveMessage(messageId, newOrderIndex) {
    try {
      // Buscar mensagem atual
      const message = await ScriptMessage.findById(messageId);
      if (!message) {
        throw new Error('Mensagem não encontrada');
      }

      const currentOrder = message.order_index;
      const scriptId = message.script_id;

      // Se a nova posição é a mesma, não fazer nada
      if (currentOrder === newOrderIndex) {
        return message;
      }

      await database.query('START TRANSACTION');

      if (currentOrder < newOrderIndex) {
        // Mover para baixo: decrementar ordem das mensagens entre currentOrder e newOrderIndex
        const sql = `
          UPDATE script_messages 
          SET order_index = order_index - 1 
          WHERE script_id = ? AND order_index > ? AND order_index <= ?
        `;
        await database.query(sql, [scriptId, currentOrder, newOrderIndex]);
      } else {
        // Mover para cima: incrementar ordem das mensagens entre newOrderIndex e currentOrder
        const sql = `
          UPDATE script_messages 
          SET order_index = order_index + 1 
          WHERE script_id = ? AND order_index >= ? AND order_index < ?
        `;
        await database.query(sql, [scriptId, newOrderIndex, currentOrder]);
      }

      // Atualizar a mensagem para a nova posição
      const updateSql = 'UPDATE script_messages SET order_index = ? WHERE id = ?';
      await database.query(updateSql, [newOrderIndex, messageId]);

      await database.query('COMMIT');

      // Buscar mensagem atualizada
      const updatedMessage = await ScriptMessage.findById(messageId);
      logger.info(`Mensagem movida para posição ${newOrderIndex}`);
      
      return updatedMessage;
    } catch (error) {
      await database.query('ROLLBACK');
      logger.error('Erro ao mover mensagem:', error);
      throw error;
    }
  }

  // Normalizar índices de ordem das mensagens de um roteiro
  static async normalizeOrderIndexes(scriptId) {
    const messages = await ScriptMessage.findByScript(scriptId, { order_by: 'order_index', order_direction: 'ASC', page: 1, limit: 1000 });
    await database.transaction(async (connection) => {
      for (let i = 0; i < messages.length; i++) {
        if (messages[i].order_index !== i) {
          await connection.execute(
            'UPDATE script_messages SET order_index = ? WHERE id = ? AND script_id = ?',
            [i, messages[i].id, scriptId]
          );
        }
      }
    });
  }

  // Buscar mensagens por personagem
  static async findByCharacter(characterId, options = {}) {
    try {
      const { script_id, page, limit } = options;
      
      let sql = `
        SELECT 
          sm.*,
          c.name as character_name,
          c.color as character_color,
          c.avatar_url as character_avatar
        FROM script_messages sm
        LEFT JOIN characters c ON sm.character_id = c.id
        WHERE sm.character_id = ?
      `;
      const params = [characterId];

      if (script_id) {
        sql += ' AND sm.script_id = ?';
        params.push(script_id);
      }

      sql += ' ORDER BY sm.order_index ASC, sm.created_at ASC';

      if (page && limit) {
        const offset = (page - 1) * limit;
        sql += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);
      }

      const rows = await database.query(sql, params);
      return rows.map(row => new ScriptMessage(row));
    } catch (error) {
      logger.error('Erro ao buscar mensagens por personagem:', error);
      throw error;
    }
  }

  // Contar mensagens por roteiro
  static async countByScript(scriptId) {
    try {
      const sql = 'SELECT COUNT(*) as count FROM script_messages WHERE script_id = ?';
      const result = await database.query(sql, [scriptId]);
      return result[0].count;
    } catch (error) {
      logger.error('Erro ao contar mensagens por roteiro:', error);
      throw error;
    }
  }

  // Contar mensagens por personagem
  static async countByCharacter(characterId, scriptId = null) {
    try {
      let sql = 'SELECT COUNT(*) as count FROM script_messages WHERE character_id = ?';
      const params = [characterId];

      if (scriptId) {
        sql += ' AND script_id = ?';
        params.push(scriptId);
      }

      const result = await database.query(sql, params);
      return result[0].count;
    } catch (error) {
      logger.error('Erro ao contar mensagens por personagem:', error);
      throw error;
    }
  }

  // Buscar mensagens com filtros avançados
  static async findWithFilters(filters = {}) {
    try {
      const {
        script_id,
        character_id,
        search,
        page = 1,
        limit = 10,
        order_by = 'order_index',
        order_direction = 'ASC'
      } = filters;

      const offset = (page - 1) * limit;
      
      let sql = `
        SELECT 
          sm.*,
          c.name as character_name,
          c.color as character_color,
          c.avatar_url as character_avatar
        FROM script_messages sm
        LEFT JOIN characters c ON sm.character_id = c.id
        WHERE 1=1
      `;
      const params = [];

      if (script_id) {
        sql += ' AND sm.script_id = ?';
        params.push(script_id);
      }

      if (character_id) {
        sql += ' AND sm.character_id = ?';
        params.push(character_id);
      }

      if (search) {
        sql += ' AND sm.message LIKE ?';
        params.push(`%${search}%`);
      }

      // Contar total
      const countSql = sql.replace('SELECT sm.*, c.name as character_name, c.color as character_color, c.avatar_url as character_avatar', 'SELECT COUNT(*) as total');
      const countResult = await database.query(countSql, params);
      const total = countResult[0].total;

      // Ordenação
      const allowedOrderFields = ['order_index', 'created_at', 'id'];
      const allowedDirections = ['ASC', 'DESC'];
      
      const orderField = allowedOrderFields.includes(order_by) ? order_by : 'order_index';
      const orderDir = allowedDirections.includes(order_direction.toUpperCase()) ? order_direction.toUpperCase() : 'ASC';
      
      sql += ` ORDER BY ${orderField} ${orderDir}`;
      sql += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const rows = await database.query(sql, params);
      const messages = rows.map(row => new ScriptMessage(row));

      return {
        messages,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Erro ao buscar mensagens com filtros:', error);
      throw error;
    }
  }

  // Converter para objeto público
  toPublicObject() {
    return {
      id: this.id,
      script_id: this.script_id,
      character_id: this.character_id,
      message: this.message,
      order_index: this.order_index,
      created_at: this.created_at,
      updated_at: this.updated_at,
      character_name: this.character_name,
      character_color: this.character_color,
      character_avatar: this.character_avatar
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
      character_id: this.character_id,
      message: this.message,
      order_index: this.order_index,
      character_name: this.character_name,
      character_color: this.character_color,
      character_avatar: this.character_avatar
    };
  }
}

module.exports = ScriptMessage; 