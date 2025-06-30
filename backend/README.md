# Backend - Roteiro Verade

API REST para o sistema de criação de roteiros do canal Mundo em Verade.

## 🚀 Tecnologias

- **Node.js** 18+
- **Express.js** - Framework web
- **MySQL** 8.0 - Banco de dados
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **Winston** - Logging
- **Joi** - Validação de dados
- **Multer** - Upload de arquivos

## 📁 Estrutura do Projeto

```
backend/
├── config/           # Configurações (banco, etc.)
├── controllers/      # Controladores das rotas
├── middleware/       # Middlewares (auth, cors, etc.)
├── models/          # Modelos de dados
├── routes/          # Definição das rotas
├── utils/           # Utilitários (logger, etc.)
├── uploads/         # Arquivos enviados
├── logs/            # Logs da aplicação
├── server.js        # Arquivo principal
├── package.json     # Dependências
└── README.md        # Este arquivo
```

## 🔧 Configuração

### 1. Instalar Dependências

```bash
cd backend
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e configure:

```bash
cp env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Servidor
NODE_ENV=development
PORT=3001

# Banco de Dados
DB_HOST=mysql
DB_PORT=3306
DB_NAME=roteiro_verade
DB_USER=root
DB_PASSWORD=roteiro123

# JWT
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=sua_chave_refresh_secreta_aqui
JWT_REFRESH_EXPIRES_IN=7d

# Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Log
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Segurança
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Executar

#### Desenvolvimento
```bash
npm run dev
```

#### Produção
```bash
npm start
```

## 📊 Banco de Dados

### Tabelas Principais

- **users** - Usuários do sistema
- **characters** - Personagens dos roteiros
- **scripts** - Roteiros criados
- **script_messages** - Mensagens dos roteiros
- **script_shares** - Compartilhamento de roteiros
- **script_versions** - Histórico de versões
- **activity_logs** - Logs de atividade

### Usuário Padrão

- **Username**: admin
- **Email**: admin@mundoemverade.com
- **Senha**: admin123
- **Role**: admin

## 🔌 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token

### Personagens
- `GET /api/characters` - Listar personagens
- `GET /api/characters/:id` - Obter personagem
- `POST /api/characters` - Criar personagem (admin)
- `PUT /api/characters/:id` - Atualizar personagem (admin)
- `DELETE /api/characters/:id` - Remover personagem (admin)

### Roteiros
- `GET /api/scripts` - Listar roteiros (paginado)
- `GET /api/scripts/public` - Listar roteiros públicos
- `GET /api/scripts/recent` - Listar roteiros recentes
- `GET /api/scripts/user/scripts` - Listar roteiros do usuário
- `GET /api/scripts/user/shared` - Listar roteiros compartilhados com o usuário
- `GET /api/scripts/:id` - Obter roteiro
- `POST /api/scripts` - Criar roteiro
- `PUT /api/scripts/:id` - Atualizar roteiro
- `DELETE /api/scripts/:id` - Remover roteiro
- `GET /api/scripts/:id/export` - Exportar roteiro (PDF, TXT)
  - **Atenção:** A exportação real para PDF/TXT ainda não está implementada. Atualmente, o endpoint retorna os dados do roteiro em JSON. Implementação da exportação para arquivo é uma feature pendente.
- `GET /api/scripts/:id/stats` - Obter estatísticas de um roteiro

### Mensagens
- `GET /api/scripts/:id/messages` - Listar mensagens de um roteiro
- `POST /api/scripts/:id/messages` - Adicionar mensagem
- `PUT /api/scripts/:id/messages/:messageId` - Editar mensagem
- `DELETE /api/scripts/:id/messages/:messageId` - Remover mensagem
- `POST /api/scripts/:id/messages/reorder` - Reordenar mensagens
- `POST /api/scripts/:id/messages/:messageId/duplicate` - Duplicar mensagem (removido, não disponível)

### Compartilhamento (Shares)
- `GET /api/shares/script/:id` - Listar compartilhamentos de um roteiro
- `GET /api/shares/user` - Listar roteiros compartilhados com o usuário logado
- `POST /api/shares/script/:id` - Compartilhar um roteiro com outro usuário
- `PUT /api/shares/script/:id/:shareId` - Atualizar permissão de um compartilhamento
- `DELETE /api/shares/script/:id/:shareId` - Remover um compartilhamento específico
- `DELETE /api/shares/script/:id` - Remover todos os compartilhamentos de um roteiro
- `GET /api/shares/users/search` - Buscar usuários para compartilhar
- `GET /api/shares/script/:id/permissions` - Checar permissões do usuário em um roteiro
- `GET /api/shares/stats` - Obter estatísticas de compartilhamento

### Estatísticas (Stats)
- `GET /api/stats` - Obter estatísticas globais do sistema
- `GET /api/stats/scripts` - Obter estatísticas detalhadas sobre roteiros
- `GET /api/stats/characters` - Obter estatísticas detalhadas sobre personagens
- `GET /api/stats/shares` - Obter estatísticas detalhadas sobre compartilhamentos

### Utilitários
- `GET /api/health` - Health check

## 📖 API Documentation (Swagger)

A documentação completa e interativa da API está disponível usando Swagger UI.

Para acessar a documentação, inicie o servidor de desenvolvimento e acesse a seguinte URL no seu navegador:

- **URL**: [http://localhost:3001/api-docs](http://localhost:3001/api-docs)

A interface do Swagger permite visualizar todos os endpoints, seus parâmetros, schemas de resposta e testar as rotas diretamente do navegador.

## 🔐 Autenticação

O sistema usa JWT (JSON Web Tokens) para autenticação.

### Headers Necessários
```
Authorization: Bearer <token>
```

### Roles de Usuário
- **admin**: Acesso total ao sistema
- **editor**: Pode criar e editar roteiros
- **viewer**: Apenas visualização

## 📝 Logs

Os logs são salvos em:
- `logs/combined.log` - Todos os logs
- `logs/error.log` - Apenas erros

### Níveis de Log
- **error**: Erros críticos
- **warn**: Avisos
- **info**: Informações gerais
- **debug**: Debug (apenas desenvolvimento)

## 🛡️ Segurança

- **Helmet** - Headers de segurança
- **CORS** - Controle de origem
- **Rate Limiting** - Limite de requisições
- **Input Validation** - Validação de entrada
- **SQL Injection Protection** - Prepared statements
- **XSS Protection** - Sanitização de dados

## 🐳 Docker

### Build da Imagem
```bash
docker build -f Dockerfile.backend -t roteiro-verade-backend .
```

### Executar Container
```bash
docker run -p 3001:3001 roteiro-verade-backend
```

## 🧪 Testes

```bash
# Executar testes
npm test

# Executar testes em modo watch
npm run test:watch

# Cobertura de testes
npm run test:coverage
```

## 📈 Monitoramento

### Health Check
```bash
curl http://localhost:3001/api/health
```

### Métricas
- Tempo de resposta
- Taxa de erro
- Uso de memória
- Conexões ativas

## 🔧 Scripts Disponíveis

```bash
npm start          # Iniciar em produção
npm run dev        # Iniciar em desenvolvimento
npm test           # Executar testes
npm run lint       # Verificar código
```