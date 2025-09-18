.PHONY: help build dev prod test clean backup

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build production Docker images
	docker-compose -f docker-compose.yml build

dev: ## Start development environment
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Development environment started at http://localhost:4000"

prod: ## Start production environment
	docker-compose -f docker-compose.yml up -d
	@echo "Production environment started at http://localhost"

test: ## Run tests
	docker-compose -f docker-compose.dev.yml exec app-dev npm test

test-coverage: ## Run tests with coverage
	docker-compose -f docker-compose.dev.yml exec app-dev npm run test:coverage

logs: ## View application logs
	docker-compose -f docker-compose.yml logs -f app

backup: ## Create backup
	./scripts/backup.sh

deploy: ## Deploy to production
	./scripts/deploy.sh

clean: ## Clean up Docker resources
	docker-compose -f docker-compose.yml down -v
	docker-compose -f docker-compose.dev.yml down -v
	docker system prune -f

migrate: ## Run database migrations
	docker-compose -f docker-compose.yml exec app npx prisma migrate deploy

seed: ## Seed database with sample data
	docker-compose -f docker-compose.yml exec app npx prisma db seed
