const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Configurar storage para uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    const characterPath = path.join(uploadPath, 'characters');
    
    // Criar diretórios se não existirem
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    if (!fs.existsSync(characterPath)) {
      fs.mkdirSync(characterPath, { recursive: true });
    }
    
    cb(null, characterPath);
  },
  filename: (req, file, cb) => {
    // Gerar nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    
    // Sanitizar nome do arquivo
    const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${sanitizedName}-${uniqueSuffix}${ext}`;
    
    cb(null, filename);
  }
});

// Filtro de arquivos
const fileFilter = (req, file, cb) => {
  // Verificar tipo de arquivo
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Apenas imagens (JPEG, PNG, GIF, WebP) são aceitas.'), false);
  }
};

// Configuração do multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB padrão
    files: 1 // Apenas 1 arquivo por vez
  }
});

// Middleware para upload de avatar de personagem
const uploadCharacterAvatar = upload.single('avatar');

// Middleware para tratamento de erros de upload
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'Arquivo muito grande. Tamanho máximo permitido: 5MB'
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Muitos arquivos enviados. Apenas 1 arquivo é permitido'
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Campo de arquivo inesperado'
      });
    }
    
    logger.error('Erro do Multer:', error);
    return res.status(400).json({
      success: false,
      error: 'Erro no upload do arquivo'
    });
  }
  
  if (error.message.includes('Tipo de arquivo não permitido')) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
  
  logger.error('Erro no upload:', error);
  return res.status(500).json({
    success: false,
    error: 'Erro interno no servidor'
  });
};

// Middleware para validar arquivo enviado
const validateUploadedFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'Nenhum arquivo foi enviado'
    });
  }
  
  // Verificar se o arquivo foi salvo corretamente
  if (!req.file.filename) {
    return res.status(500).json({
      success: false,
      error: 'Erro ao salvar arquivo'
    });
  }
  
  // Adicionar informações do arquivo à requisição
  req.fileInfo = {
    filename: req.file.filename,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    path: req.file.path
  };
  
  logger.info(`Arquivo enviado: ${req.file.originalname} -> ${req.file.filename}`);
  next();
};

// Middleware para servir arquivos estáticos
const serveStaticFiles = (req, res, next) => {
  const uploadPath = process.env.UPLOAD_PATH || './uploads';
  
  // Verificar se a requisição é para um arquivo de upload
  if (req.path.startsWith('/uploads/')) {
    const filePath = path.join(uploadPath, req.path.replace('/uploads/', ''));
    
    // Verificar se o arquivo existe
    if (fs.existsSync(filePath)) {
      return res.sendFile(path.resolve(filePath));
    } else {
      return res.status(404).json({
        success: false,
        error: 'Arquivo não encontrado'
      });
    }
  }
  
  next();
};

// Função para remover arquivo
const removeFile = async (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      logger.info(`Arquivo removido: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Erro ao remover arquivo:', error);
    return false;
  }
};

// Função para obter informações do arquivo
const getFileInfo = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      return {
        exists: true,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };
    }
    return { exists: false };
  } catch (error) {
    logger.error('Erro ao obter informações do arquivo:', error);
    return { exists: false, error: error.message };
  }
};

// Função para limpar arquivos órfãos
const cleanupOrphanedFiles = async () => {
  try {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    const characterPath = path.join(uploadPath, 'characters');
    
    if (!fs.existsSync(characterPath)) {
      return;
    }
    
    const files = await fs.promises.readdir(characterPath);
    const database = require('../config/database');
    
    for (const file of files) {
      const filePath = path.join(characterPath, file);
      const avatarUrl = `/uploads/characters/${file}`;
      
      // Verificar se o arquivo está sendo usado no banco
      const sql = 'SELECT COUNT(*) as count FROM characters WHERE avatar_url = ?';
      const result = await database.query(sql, [avatarUrl]);
      
      if (result[0].count === 0) {
        // Arquivo não está sendo usado, remover
        await removeFile(filePath);
        logger.info(`Arquivo órfão removido: ${file}`);
      }
    }
  } catch (error) {
    logger.error('Erro ao limpar arquivos órfãos:', error);
  }
};

module.exports = {
  upload,
  uploadCharacterAvatar,
  handleUploadError,
  validateUploadedFile,
  serveStaticFiles,
  removeFile,
  getFileInfo,
  cleanupOrphanedFiles
}; 