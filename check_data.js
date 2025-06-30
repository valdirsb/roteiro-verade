const mysql = require('mysql2/promise');

async function checkData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'roteiro_verade'
  });

  try {
    console.log('=== VERIFICANDO DADOS NO BANCO ===\n');

    // Verificar scripts
    const [scripts] = await connection.execute('SELECT COUNT(*) as count FROM scripts');
    console.log(`Scripts: ${scripts[0].count}`);

    // Verificar personagens
    const [characters] = await connection.execute('SELECT COUNT(*) as count FROM characters');
    console.log(`Personagens: ${characters[0].count}`);

    // Verificar compartilhamentos
    const [shares] = await connection.execute('SELECT COUNT(*) as count FROM script_shares');
    console.log(`Compartilhamentos: ${shares[0].count}`);

    // Verificar usuários
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`Usuários: ${users[0].count}`);

    // Verificar mensagens
    const [messages] = await connection.execute('SELECT COUNT(*) as count FROM script_messages');
    console.log(`Mensagens: ${messages[0].count}`);

    // Verificar scripts recentes
    const [recentScripts] = await connection.execute(`
      SELECT id, title, description, updated_at, is_public
      FROM scripts 
      ORDER BY updated_at DESC 
      LIMIT 5
    `);
    console.log('\n=== SCRIPTS RECENTES ===');
    recentScripts.forEach(script => {
      console.log(`ID: ${script.id}, Título: ${script.title}, Atualizado: ${script.updated_at}`);
    });

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await connection.end();
  }
}

checkData(); 