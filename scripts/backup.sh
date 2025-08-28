#!/bin/bash

set -e

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

echo "🗄️ Starting backup process..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
echo "📊 Backing up PostgreSQL database..."
docker-compose exec -T db pg_dump -U eventuser eventdb > "$BACKUP_DIR/eventdb_$DATE.sql"

# Redis backup
echo "🔴 Backing up Redis data..."
docker-compose exec -T redis redis-cli BGSAVE
docker cp $(docker-compose ps -q redis):/data/dump.rdb "$BACKUP_DIR/redis_$DATE.rdb"

# Application logs backup
echo "📝 Backing up application logs..."
docker-compose logs app > "$BACKUP_DIR/app_logs_$DATE.log"

# Cleanup old backups (keep last 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.rdb" -mtime +7 -delete
find $BACKUP_DIR -name "*.log" -mtime +7 -delete

echo "✅ Backup completed successfully!"
echo "📁 Backup files saved to: $BACKUP_DIR"
