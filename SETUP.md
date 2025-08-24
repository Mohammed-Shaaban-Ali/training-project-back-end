# Postgres + NestJS + TypeORM + Docker Setup Guide

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git

### 1. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
# DB_HOST=localhost (for local development)
# DB_HOST=postgres (for Docker)
```

### 2. Development Setup (Local)

```bash
# Install dependencies
npm install

# Start PostgreSQL with Docker
docker-compose up postgres -d

# Run migrations
npm run migration:run

# Start development server
npm run start:dev
```

### 3. Production Setup (Docker)

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

## 📁 Project Structure

```
src/
├── config/
│   ├── database.config.ts    # TypeORM configuration
│   └── typeorm.config.ts     # Migration configuration
├── migrations/               # Database migrations
├── modules/
│   └── users/
│       ├── users.entity.ts   # User entity
│       └── ...
└── main.ts                  # Application entry point
```

## 🗃️ Database Migrations

### Generate Migration

```bash
# Auto-generate migration from entity changes
npm run migration:generate

# Create empty migration
npm run migration:create
```

### Run Migrations

```bash
# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show
```

## 🔧 Configuration

### Environment Variables

- **Development**: `.env`
- **Production**: `.env.production`
- **Example**: `.env.example`

### Database Configuration

Located in `src/config/database.config.ts`:

- Connection pooling
- Retry logic
- Migration settings
- Entity auto-loading

### Docker Configuration

- **PostgreSQL**: Latest Alpine image
- **App**: Node.js 18 Alpine
- **Health checks**: Enabled
- **Volumes**: Persistent data

## 📋 Available Scripts

### Development

```bash
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debugging
```

### Production

```bash
npm run build             # Build application
npm run start:prod        # Start production server
```

### Database

```bash
npm run migration:generate  # Generates a new migration file based on changes in your entities.
npm run migration:create    # Generates a new migration file based on changes in your entities.
npm run migration:run       # Runs all pending migrations (applies them to the database).
npm run migration:revert    # Reverts the last executed migration.
npm run migration:show      # Shows all migrations and their status (executed or pending).

# u can add the file name when use generate and create command
# eg: npm run migration:generate --name=[you migration name here]
```

### Testing

```bash
npm run test              # Unit tests
npm run test:e2e          # End-to-end tests
npm run test:cov          # Test coverage
```

## 🐳 Docker Commands

### Development

```bash
# Start only database
docker-compose up postgres -d

# Start all services
docker-compose up

# View logs
docker-compose logs -f app
```

### Production

```bash
# Build and start
docker-compose up --build -d

# Stop all services
docker-compose down

# Clean up
docker-compose down -v --remove-orphans
```

## 🛠️ Configuration Files

### TypeORM Settings

- **Development**: `synchronize: true` (auto-sync entities)
- **Production**: `synchronize: false` (use migrations)
- **Migrations**: Automatic running in production

### Docker Settings

- **PostgreSQL Port**: 5432
- **App Port**: 3000
- **Health Checks**: Enabled
- **Auto-restart**: Always

## 🔍 Troubleshooting

### Database Connection Issues

1. Check PostgreSQL is running: `docker-compose ps`
2. Verify environment variables in `.env`
3. Check database logs: `docker-compose logs postgres`

### Migration Issues

1. Ensure database is running
2. Check migration files in `src/migrations/`
3. Verify TypeORM configuration

### Docker Issues

1. Clean Docker cache: `docker system prune`
2. Rebuild containers: `docker-compose up --build --force-recreate`
3. Check container logs: `docker-compose logs`

## 📝 Best Practices

### Development

- Use `synchronize: true` for rapid prototyping
- Always create migrations for production
- Use environment variables for configuration

### Production

- Set `synchronize: false`
- Run migrations on deployment
- Use Docker secrets for sensitive data
- Monitor database performance

### Migrations

- Review generated migrations before running
- Test migrations on staging environment
- Keep migrations small and focused
- Never edit existing migrations

## 🎯 Next Steps

1. **Add Authentication**: JWT, Passport.js
2. **Add Validation**: Class-validator decorators
3. **Add Logging**: Winston, Morgan
4. **Add Caching**: Redis integration
5. **Add Testing**: Unit and integration tests
6. **Add Documentation**: Swagger/OpenAPI
7. **Add Monitoring**: Health checks, metrics
