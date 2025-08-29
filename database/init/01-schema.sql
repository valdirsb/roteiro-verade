-- =====================================================
-- SCHEMA DO BANCO DE DADOS - ROTEIRO VERADE
-- =====================================================

USE roteiro_verade;

-- =====================================================
-- TABELA DE USUÁRIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'editor', 'viewer') DEFAULT 'viewer',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (is_active)
);

-- =====================================================
-- TABELA DE PERSONAGENS
-- =====================================================
CREATE TABLE IF NOT EXISTS characters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL, -- Código hex da cor (#RRGGBB)
    avatar_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_name (name),
    INDEX idx_active (is_active),
    INDEX idx_created_by (created_by)
);

-- =====================================================
-- TABELA DE ROTEIROS
-- =====================================================
CREATE TABLE IF NOT EXISTS scripts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_title (title),
    INDEX idx_public (is_public),
    INDEX idx_created_by (created_by),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- TABELA DE MENSAGENS DOS ROTEIROS
-- =====================================================
CREATE TABLE IF NOT EXISTS script_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    script_id INT NOT NULL,
    character_id INT,
    message TEXT NOT NULL,
    order_index INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE SET NULL,
    INDEX idx_script_id (script_id),
    INDEX idx_character_id (character_id),
    INDEX idx_order_index (order_index),
    UNIQUE KEY unique_script_order (script_id, order_index)
);

-- =====================================================
-- TABELA DE COMPARTILHAMENTO DE ROTEIROS
-- =====================================================
CREATE TABLE IF NOT EXISTS script_shares (
    id INT AUTO_INCREMENT PRIMARY KEY,
    script_id INT NOT NULL,
    shared_with INT NOT NULL,
    shared_by INT NOT NULL,
    permission ENUM('view', 'edit') DEFAULT 'view',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_with) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_script_id (script_id),
    INDEX idx_shared_with (shared_with),
    INDEX idx_shared_by (shared_by),
    UNIQUE KEY unique_script_share (script_id, shared_with)
);

-- =====================================================
-- TABELA DE LOGS DE ATIVIDADE
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INT,
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_table_name (table_name),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- TABELA DE TOKENS DE REFRESH
-- =====================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token (token),
    INDEX idx_expires_at (expires_at)
);

-- =====================================================
-- MENSAGEM DE CONFIRMAÇÃO
-- =====================================================
SELECT 'Schema do banco de dados criado com sucesso!' as message; 