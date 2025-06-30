-- =====================================================
-- DADOS INICIAIS - ROTEIRO VERADE
-- =====================================================

USE roteiro_verade;

-- =====================================================
-- USUÁRIO ADMINISTRADOR PADRÃO
-- =====================================================
-- Senha: admin123 (hash bcrypt)
INSERT INTO users (username, email, password_hash, role, is_active) VALUES
('admin', 'admin@mundoemverade.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', 'admin', TRUE)
ON DUPLICATE KEY UPDATE 
    password_hash = VALUES(password_hash),
    role = VALUES(role),
    is_active = VALUES(is_active);

-- =====================================================
-- PERSONAGENS PADRÃO DO MUNDO EM VERADE
-- =====================================================
INSERT INTO characters (name, color, avatar_url, is_active, created_by) VALUES
('Liry', '#8B5CF6', '/liry.png', TRUE, 1),
('Zad', '#F97316', '/zad.png', TRUE, 1),
('Kim', '#10B981', '/kim.png', TRUE, 1),
('Camila', '#EF4444', '/camila.png', TRUE, 1),
('Texto de Ação', '#6B7280', NULL, TRUE, 1)
ON DUPLICATE KEY UPDATE 
    color = VALUES(color),
    avatar_url = VALUES(avatar_url),
    is_active = VALUES(is_active);

-- =====================================================
-- ROTEIRO DE EXEMPLO
-- =====================================================
INSERT INTO scripts (title, description, is_public, created_by) VALUES
('Roteiro de Exemplo', 'Um roteiro de exemplo para demonstrar as funcionalidades do sistema', TRUE, 1)
ON DUPLICATE KEY UPDATE 
    description = VALUES(description),
    is_public = VALUES(is_public);

-- Obter o ID do roteiro criado
SET @script_id = LAST_INSERT_ID();

-- Mensagens do roteiro de exemplo
INSERT INTO script_messages (script_id, character_id, message, order_index) VALUES
(@script_id, (SELECT id FROM characters WHERE name = 'Liry' LIMIT 1), 'Olá pessoal! Bem-vindos ao nosso canal!', 1),
(@script_id, (SELECT id FROM characters WHERE name = 'Zad' LIMIT 1), 'Oi galera! Como vocês estão?', 2),
(@script_id, (SELECT id FROM characters WHERE name = 'Kim' LIMIT 1), 'Oi! Tudo bem com vocês?', 3),
(@script_id, (SELECT id FROM characters WHERE name = 'Texto de Ação' LIMIT 1), 'Todos riem e se cumprimentam', 4),
(@script_id, (SELECT id FROM characters WHERE name = 'Camila' LIMIT 1), 'Hoje vamos falar sobre algo muito interessante!', 5)
ON DUPLICATE KEY UPDATE 
    message = VALUES(message),
    order_index = VALUES(order_index);

-- =====================================================
-- LOGS DE ATIVIDADE INICIAL
-- =====================================================
INSERT INTO activity_logs (user_id, action, table_name, record_id, details, ip_address, user_agent) VALUES
(1, 'CREATE', 'users', 1, '{"username": "admin", "role": "admin"}', '127.0.0.1', 'System/1.0'),
(1, 'CREATE', 'characters', 1, '{"name": "Liry", "color": "#8B5CF6"}', '127.0.0.1', 'System/1.0'),
(1, 'CREATE', 'characters', 2, '{"name": "Zad", "color": "#F97316"}', '127.0.0.1', 'System/1.0'),
(1, 'CREATE', 'characters', 3, '{"name": "Kim", "color": "#10B981"}', '127.0.0.1', 'System/1.0'),
(1, 'CREATE', 'characters', 4, '{"name": "Camila", "color": "#EF4444"}', '127.0.0.1', 'System/1.0'),
(1, 'CREATE', 'characters', 5, '{"name": "Texto de Ação", "color": "#6B7280"}', '127.0.0.1', 'System/1.0'),
(1, 'CREATE', 'scripts', @script_id, '{"title": "Roteiro de Exemplo"}', '127.0.0.1', 'System/1.0');

-- =====================================================
-- MENSAGEM DE CONFIRMAÇÃO
-- =====================================================
SELECT 'Dados iniciais criados com sucesso!' as message;
SELECT 
    'Usuário Admin:' as info,
    username,
    email,
    role
FROM users WHERE username = 'admin';

SELECT 
    'Personagens criados:' as info,
    name,
    color
FROM characters WHERE is_active = TRUE;

SELECT 
    'Roteiro de exemplo:' as info,
    title,
    description
FROM scripts WHERE title = 'Roteiro de Exemplo'; 