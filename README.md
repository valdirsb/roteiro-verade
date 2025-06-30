# 🎭 Roteiro Verade

Uma ferramenta web interativa para criar roteiros de diálogos dos vídeos do canal **Mundo em Verade** no YouTube.

## 📺 Sobre o Projeto

O **Roteiro Verade** é uma aplicação full-stack desenvolvida para facilitar a criação e organização de roteiros dos vídeos de animação do canal [Mundo em Verade](https://www.youtube.com/@mundo.em.verade). A ferramenta permite aos criadores de conteúdo escrever diálogos de forma colaborativa e visual, simulando conversas entre os personagens do canal.

## 🎭 Personagens

A aplicação inclui os seguintes personagens do universo Mundo em Verade:

*   **Liry** 🟣 - Personagem principal com tema roxo
*   **Zad** 🟠 - Personagem com tema laranja
*   **Kim** 🟢 - Personagem com tema verde
*   **Camila** 🔴 - Personagem com tema vermelho
*   **Texto de Ação** ⚪ - Para descrições de cena e ações

Cada personagem possui seu próprio avatar e cor distintiva para facilitar a identificação visual durante a criação do roteiro.

## ✨ Funcionalidades

### 🎨 Interface Moderna
- **Interface de Chat Intuitiva**: Interface similar a um chat para facilitar a criação de diálogos
- **Sistema de Temas**: Suporte a tema claro e escuro
- **Layout Responsivo**: Adaptável para desktop, tablet e mobile
- **Animações Suaves**: Transições e feedback visual

### 👥 Sistema de Usuários
- **Autenticação JWT**: Login seguro com tokens
- **Controle de Acesso**: Roles de usuário (admin, editor, viewer)
- **Perfis de Usuário**: Gestão de dados pessoais
- **Sistema de Permissões**: Controle granular de acesso

### 🎭 Gestão de Personagens
- **CRUD Completo**: Criar, editar, visualizar e desativar personagens
- **Upload de Avatares**: Sistema de upload de imagens
- **Personagens Padrão**: Liry, Zad, Kim, Camila e Texto de Ação
- **Cores Distintivas**: Cada personagem tem sua cor característica

### 📝 Sistema de Roteiros
- **Editor de Roteiros**: Interface intuitiva para criação
- **Mensagens Ordenadas**: Sistema de ordenação cronológica
- **Compartilhamento**: Compartilhar roteiros entre usuários
- **Histórico de Versões**: Controle de alterações
- **Exportação**: Exportar roteiros em diferentes formatos

### 🔍 Funcionalidades Avançadas
- **Busca Global**: Buscar roteiros, personagens e conteúdo
- **Notificações**: Sistema de notificações em tempo real
- **Dashboard**: Visão geral com estatísticas
- **Sistema de Modais**: Interface modal para ações rápidas

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Vue.js 3** - Framework JavaScript progressivo
- **Vue Router 4** - Roteamento da aplicação
- **Vuex 4** - Gerenciamento de estado
- **Vite** - Build tool e servidor de desenvolvimento
- **Axios** - Cliente HTTP para APIs

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MySQL** - Banco de dados relacional
- **JWT** - Autenticação com tokens
- **Multer** - Upload de arquivos
- **Joi** - Validação de dados
- **Winston** - Sistema de logging

### Infraestrutura
- **Docker** - Containerização
- **Docker Compose** - Orquestração de containers
- **Nginx** - Proxy reverso
- **phpMyAdmin** - Interface de administração do banco

## 📦 Instalação e Execução

### Pré-requisitos

- **Docker** e **Docker Compose**
- **Node.js** 16+ (para desenvolvimento local)
- **Git**

### 🚀 Execução Rápida com Docker

```bash
# Clone o repositório
git clone [url-do-repositorio]
cd roteiro-verade

# Iniciar todos os serviços
docker-compose up -d

# Acessar a aplicação
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# phpMyAdmin: http://localhost:8080
```

### 🔧 Desenvolvimento Local

```bash
# Clone o repositório
git clone [url-do-repositorio]
cd roteiro-verade

# Instalar dependências do frontend
npm install

# Instalar dependências do backend
cd backend
npm install
cd ..

# Configurar variáveis de ambiente
cp backend/env.example backend/.env
# Editar backend/.env com suas configurações

# Iniciar banco de dados
docker-compose up -d mysql phpmyadmin

# Iniciar backend
cd backend
npm run dev

# Em outro terminal, iniciar frontend
npm run dev
```

### 📋 Configuração do Banco de Dados

O banco de dados será criado automaticamente na primeira execução. Os dados iniciais incluem:

- **Usuário Admin**: admin@roteiroverade.com / admin123
- **Personagens Padrão**: Liry, Zad, Kim, Camila, Texto de Ação

### 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na pasta `backend/`:

```env
# Servidor
PORT=3001
NODE_ENV=development

# Banco de Dados
DB_HOST=localhost
DB_PORT=3306
DB_NAME=roteiro_verade
DB_USER=root
DB_PASSWORD=sua_senha

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro
JWT_EXPIRES_IN=24h

# Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

## 🎯 Casos de Uso

### Para Criadores de Conteúdo
- **Criação de Roteiros**: Escrever diálogos para vídeos do canal
- **Brainstorming**: Desenvolver ideias de conversas entre personagens
- **Revisão**: Organizar e revisar diálogos antes da gravação
- **Colaboração**: Trabalhar em equipe na criação de roteiros

### Para Administradores
- **Gestão de Usuários**: Criar e gerenciar contas de usuários
- **Gestão de Personagens**: Adicionar novos personagens e avatares
- **Monitoramento**: Acompanhar uso e estatísticas da plataforma
- **Backup**: Sistema de backup automático do banco de dados

## 📱 Compatibilidade

- ✅ **Desktop** (Chrome, Firefox, Safari, Edge)
- ✅ **Tablet** (iPad, Android)
- ✅ **Mobile** (iPhone, Android) - Responsivo

## 🏗️ Arquitetura

```
roteiro-verade/
├── backend/                 # API Node.js/Express
│   ├── controllers/        # Controladores da aplicação
│   ├── models/            # Modelos de dados
│   ├── routes/            # Rotas da API
│   ├── middleware/        # Middlewares
│   └── utils/             # Utilitários
├── src/                   # Frontend Vue.js
│   ├── components/        # Componentes Vue
│   ├── views/            # Páginas da aplicação
│   ├── services/         # Serviços de API
│   ├── store/            # Store Vuex
│   └── router/           # Configuração de rotas
├── database/             # Scripts de banco de dados
├── uploads/              # Arquivos enviados
└── docker-compose.yml    # Configuração Docker
```

## 🔧 Scripts Disponíveis

### Frontend
```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview da build
npm run lint         # Linting do código
```

### Backend
```bash
npm run dev          # Servidor de desenvolvimento
npm run start        # Servidor de produção
npm run lint         # Linting do código
```

### Docker
```bash
docker-compose up -d     # Iniciar todos os serviços
docker-compose down      # Parar todos os serviços
docker-compose logs      # Ver logs
```

## 📊 Status do Projeto

- **Progresso**: 90% concluído
- **Fase Atual**: Interface e Polimento
- **Próxima Meta**: Finalização e Deploy

### ✅ Funcionalidades Implementadas
- [x] Sistema de autenticação JWT
- [x] Gestão de usuários e permissões
- [x] CRUD completo de personagens
- [x] Sistema de roteiros com mensagens
- [x] Compartilhamento de roteiros
- [x] Interface responsiva
- [x] Sistema de notificações
- [x] Upload de arquivos
- [x] Dashboard com estatísticas

### 🔄 Em Desenvolvimento
- [ ] Editor de roteiros avançado
- [ ] Sistema de busca avançada
- [ ] Exportação em diferentes formatos
- [ ] Testes automatizados
- [ ] Deploy em produção

## 🤝 Contribuição

Este projeto é específico para o canal Mundo em Verade. Para contribuições ou sugestões, entre em contato com a equipe do canal.

### Como Contribuir
1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e desenvolvido especificamente para o canal Mundo em Verade.

## 🆘 Suporte

Para suporte técnico ou dúvidas:
- **Email**: suporte@roteiroverade.com
- **Issues**: [GitHub Issues](url-do-repositorio/issues)

## 📈 Roadmap

### Versão 1.0 (Atual)
- ✅ Sistema básico de roteiros
- ✅ Gestão de personagens
- ✅ Autenticação e autorização
- ✅ Interface responsiva

### Versão 1.1 (Próxima)
- 🔄 Editor de texto rico
- 🔄 Sistema de templates
- 🔄 Integração com APIs externas
- 🔄 Notificações em tempo real

### Versão 2.0 (Futuro)
- 📋 Sistema de colaboração em tempo real
- 📋 Integração com ferramentas de edição de vídeo
- 📋 Analytics avançados
- 📋 API pública para desenvolvedores

---

**Desenvolvido para o canal** [**Mundo em Verade**](https://www.youtube.com/@mundo.em.verade)

*Última atualização: Junho 2024*