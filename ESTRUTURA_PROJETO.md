# 📁 Estrutura do Projeto Roteiro Verade

Este documento descreve a organização da estrutura de pastas do projeto após a reorganização.

## 🏗️ Visão Geral da Estrutura

```
roteiro-verade/
├── frontend/               # Aplicação Vue.js
├── backend/                # API Node.js/Express
├── database/               # Scripts de banco de dados
├── scripts/                # Scripts de desenvolvimento
├── docker-compose.yml      # Configuração Docker
├── Dockerfile.backend      # Dockerfile do backend
├── package.json            # Scripts do projeto raiz
└── README.md               # Documentação principal
```

## 📂 Frontend (`frontend/`)

Aplicação Vue.js 3 com Vite.

```
frontend/
├── src/                    # Código fonte
│   ├── components/         # Componentes Vue reutilizáveis
│   │   ├── ui/            # Componentes de interface
│   │   │   ├── modals/    # Modais da aplicação
│   │   │   └── ...
│   │   ├── layout/        # Componentes de layout
│   │   └── icons/         # Ícones SVG
│   ├── views/             # Páginas da aplicação
│   │   ├── auth/          # Páginas de autenticação
│   │   ├── errors/        # Páginas de erro
│   │   └── ...
│   ├── services/          # Serviços de API
│   ├── store/             # Store Vuex
│   │   └── modules/       # Módulos do store
│   ├── router/            # Configuração de rotas
│   ├── utils/             # Utilitários
│   ├── assets/            # Recursos estáticos
│   │   ├── css/           # Estilos
│   │   └── ...
│   ├── App.vue            # Componente raiz
│   └── main.js            # Ponto de entrada
├── public/                # Arquivos públicos
├── package.json           # Dependências do frontend
├── vite.config.js         # Configuração do Vite
├── eslint.config.js       # Configuração do ESLint
├── jsconfig.json          # Configuração do JavaScript
├── .editorconfig          # Configuração do editor
├── .gitignore             # Gitignore específico
├── index.html             # HTML base
├── Dockerfile.frontend    # Dockerfile do frontend
└── nginx.conf             # Configuração do Nginx
```

## 🔧 Backend (`backend/`)

API Node.js com Express.

```
backend/
├── config/                # Configurações
│   └── database.js        # Configuração do banco
├── controllers/           # Controladores da API
├── models/                # Modelos de dados
├── routes/                # Rotas da API
├── middleware/            # Middlewares
├── utils/                 # Utilitários
├── uploads/               # Arquivos enviados
│   └── characters/        # Avatares dos personagens
├── logs/                  # Logs da aplicação
├── package.json           # Dependências do backend
├── server.js              # Servidor principal
├── env.example            # Exemplo de variáveis de ambiente
└── README.md              # Documentação do backend
```

## 🗄️ Database (`database/`)

Scripts e configurações do banco de dados.

```
database/
├── init/                  # Scripts de inicialização
│   ├── 01-schema.sql      # Schema do banco
│   └── 02-seed-data.sql   # Dados iniciais
├── migrations/            # Migrações do banco
└── backups/               # Scripts de backup
    └── backup.sh          # Script de backup
```

## 🛠️ Scripts (`scripts/`)

Scripts de desenvolvimento e automação.

```
scripts/
└── dev.sh                 # Script de desenvolvimento
```

## 🐳 Configurações Docker

- `docker-compose.yml` - Orquestração dos serviços
- `Dockerfile.backend` - Container do backend
- `frontend/Dockerfile.frontend` - Container do frontend
- `frontend/nginx.conf` - Configuração do Nginx

## 📦 Gerenciamento de Dependências

### Package.json da Raiz
Contém scripts para gerenciar todo o projeto:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev",
    "install:all": "npm install && cd frontend && npm install && cd ../backend && npm install",
    "lint": "npm run lint:frontend && npm run lint:backend",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down"
  }
}
```

### Package.json do Frontend
Gerenciado independentemente na pasta `frontend/`.

### Package.json do Backend
Gerenciado independentemente na pasta `backend/`.

## 🚀 Comandos de Desenvolvimento

### Instalação
```bash
# Instalar todas as dependências
npm run install:all

# Ou usar o script
./scripts/dev.sh install
```

### Desenvolvimento Local
```bash
# Iniciar frontend e backend simultaneamente
npm run dev

# Iniciar apenas frontend
npm run dev:frontend

# Iniciar apenas backend
npm run dev:backend

# Ou usar o script
./scripts/dev.sh all
./scripts/dev.sh frontend
./scripts/dev.sh backend
```

### Docker
```bash
# Iniciar todos os serviços
docker-compose up -d

# Ou usar o script
./scripts/dev.sh docker
```

## 🔄 Fluxo de Desenvolvimento

1. **Clone do repositório**
2. **Instalação das dependências**: `npm run install:all`
3. **Configuração do ambiente**: Copiar `backend/env.example` para `backend/.env`
4. **Inicialização do banco**: `docker-compose up -d mysql phpmyadmin`
5. **Desenvolvimento**: `npm run dev` ou `./scripts/dev.sh all`

## 📝 Notas Importantes

- **Separação clara**: Frontend e backend são completamente independentes
- **Docker otimizado**: Cada serviço tem seu próprio contexto de build
- **Scripts centralizados**: Comandos principais gerenciados na raiz
- **Desenvolvimento flexível**: Pode-se trabalhar em frontend ou backend isoladamente
- **Deploy independente**: Cada parte pode ser deployada separadamente

## 🔧 Configurações Específicas

### Frontend
- **Porta de desenvolvimento**: 5173 (Vite)
- **Porta de produção**: 8081 (Docker)
- **Build tool**: Vite
- **Framework**: Vue.js 3

### Backend
- **Porta**: 3001
- **Framework**: Express.js
- **Banco**: MySQL
- **Uploads**: `backend/uploads/`

### Banco de Dados
- **Porta**: 3306
- **Interface**: phpMyAdmin na porta 8080 