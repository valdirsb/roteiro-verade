#!/bin/bash

# Script de Backup do Banco de Dados - Roteiro Verade
# Autor: Mundo em Verade
# Data: $(date +%Y-%m-%d)

# Configurações
DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="roteiro_verade"
DB_USER="root"
DB_PASSWORD="roteiro123"
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="roteiro_verade_${DATE}.sql"
COMPRESSED_FILE="${BACKUP_FILE}.gz"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERRO: $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] AVISO: $1${NC}"
}

# Verificar se o diretório de backup existe
if [ ! -d "$BACKUP_DIR" ]; then
    log "Criando diretório de backup: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
fi

# Verificar se o MySQL está rodando
if ! mysqladmin ping -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" --silent; then
    error "MySQL não está rodando ou não consegue conectar"
    exit 1
fi

log "Iniciando backup do banco de dados..."

# Criar backup
if mysqldump -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    --add-drop-database \
    --databases "$DB_NAME" > "$BACKUP_DIR/$BACKUP_FILE"; then
    
    log "Backup criado com sucesso: $BACKUP_FILE"
    
    # Comprimir backup
    if gzip "$BACKUP_DIR/$BACKUP_FILE"; then
        log "Backup comprimido: $COMPRESSED_FILE"
        
        # Verificar tamanho do arquivo
        SIZE=$(du -h "$BACKUP_DIR/$COMPRESSED_FILE" | cut -f1)
        log "Tamanho do backup: $SIZE"
        
        # Manter apenas os últimos 10 backups
        cd "$BACKUP_DIR"
        ls -t *.sql.gz | tail -n +11 | xargs -r rm
        log "Backups antigos removidos (mantidos últimos 10)"
        
    else
        error "Falha ao comprimir backup"
        exit 1
    fi
    
else
    error "Falha ao criar backup"
    exit 1
fi

log "Backup concluído com sucesso!"
log "Arquivo: $BACKUP_DIR/$COMPRESSED_FILE"

# Verificar integridade do backup
log "Verificando integridade do backup..."
if gunzip -t "$BACKUP_DIR/$COMPRESSED_FILE"; then
    log "Backup verificado e íntegro"
else
    error "Backup corrompido!"
    exit 1
fi

log "Processo de backup finalizado com sucesso!" 