#!/bin/bash

# Script de desenvolvimento para o Roteiro Verade
# Uso: ./scripts/dev.sh [frontend|backend|all]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Roteiro Verade - Dev Script${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Verificar se o comando foi fornecido
if [ $# -eq 0 ]; then
    print_header
    echo "Uso: $0 [frontend|backend|all|install|docker]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  frontend  - Iniciar apenas o frontend"
    echo "  backend   - Iniciar apenas o backend"
    echo "  all       - Iniciar frontend e backend simultaneamente"
    echo "  install   - Instalar todas as dependências"
    echo "  docker    - Iniciar com Docker Compose"
    exit 1
fi

COMMAND=$1

case $COMMAND in
    "install")
        print_header
        print_message "Instalando todas as dependências..."
        npm run install:all
        print_message "Instalação concluída!"
        ;;
    
    "frontend")
        print_header
        print_message "Iniciando frontend..."
        cd frontend
        npm run dev
        ;;
    
    "backend")
        print_header
        print_message "Iniciando backend..."
        cd backend
        npm run dev
        ;;
    
    "all")
        print_header
        print_message "Iniciando frontend e backend simultaneamente..."
        npm run dev
        ;;
    
    "docker")
        print_header
        print_message "Iniciando serviços com Docker Compose..."
        docker-compose up -d
        print_message "Serviços iniciados!"
        print_message "Frontend: http://localhost:8081"
        print_message "Backend: http://localhost:3001"
        print_message "phpMyAdmin: http://localhost:8080"
        ;;
    
    *)
        print_error "Comando inválido: $COMMAND"
        echo "Use: $0 [frontend|backend|all|install|docker]"
        exit 1
        ;;
esac 