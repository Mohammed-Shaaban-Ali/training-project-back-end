# Training Project – Back End (NestJS + PostgreSQL)

A quick reference to run the app for **local development** and with **Docker Compose** (PostgreSQL only or full stack).

---

## Prerequisites

- **Node.js 18+** and **npm**
- **Docker Engine** & **Docker Compose** CLI
- (Optional) **psql** client for quick DB checks

---

## 1) Environment variables

Copy the example and edit:
```bash
cp .env.local .env
```

### A. When the **app runs on your host** and **Postgres runs in Docker**

Use `127.0.0.1` and the published port (`5433` in docker-compose):

```env
# App
PORT=3333
NODE_ENV=development

# Database
DB_TYPE=postgres
DB_HOST=127.0.0.1
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=lms_db

# TypeORM
TYPEORM_SYNCHRONIZE=true      # dev only!
TYPEORM_LOGGING=true
TYPEORM_MIGRATIONS_RUN=false
```

### B. When **both app and DB run in Docker Compose**

Use the **service name** (`postgres`) and the **container port** (`5432`):

```env
DB_HOST=postgres
DB_PORT=5432
# other vars same as above
```

---

## 2) Run PostgreSQL with Docker (DB only)

From the folder that contains `docker-compose.yml`:

```bash
# start only Postgres in background
docker compose up -d postgres

# check its status
docker compose ps

# tail logs
docker compose logs -f postgres
```

**Verify DB connectivity** (optional):
```bash
PGPASSWORD=postgres psql -h 127.0.0.1 -p 5433 -U postgres -d lms_db -c '\l'
```

**Stop DB**:
```bash
docker compose stop postgres
# or remove container/network (keeps named volume data)
docker compose down
```

---

## 3) Run the app **locally** (recommended during dev)

```bash
npm ci
npm run start:dev
```

The app runs on `http://localhost:3333` (health check usually at `/health`).


> If you develop locally but only want DB in Docker, prefer sections **2** + **3**.


## 4) Useful Docker & Compose commands

**Containers**
```bash
docker ps                          # running containers
docker stop <name|id>              # stop a container
docker start <name|id>             # start a container
docker restart <name|id>           # restart a container
docker logs -f <name|id>           # follow logs
```

**Compose (run from the compose folder)**
```bash
docker compose up -d               # start all services
docker compose up -d postgres      # start only postgres
docker compose ps                  # list services
docker compose logs -f app         # app logs
docker compose stop                # stop services
docker compose down                # stop & remove containers & network
```

**Docker daemon on Linux**
```bash
sudo systemctl status docker
sudo systemctl restart docker
```

**Fix permissions once (Linux)**
```bash
sudo usermod -aG docker $USER
# then log out and log back in
```

---

## 5) Troubleshooting

- **`getaddrinfo ENOTFOUND postgres`**  
  You are running the app on the host while DB is in Docker.  
  In `.env`, set `DB_HOST=127.0.0.1` and `DB_PORT=5433`.  
  (Use `DB_HOST=postgres` and `DB_PORT=5432` **only when the app itself runs in Compose**.)

- **`ECONNREFUSED :5433`**  
  DB not started or wrong port. Run `docker compose ps`, check logs, confirm port mappings.

- **`permission denied /var/run/docker.sock`**  
  Run commands with `sudo` or add your user to the `docker` group (see above).

- **`nest: not found` inside container**  
  Ensure the image is built with dev tools in the build stage (the provided Dockerfile multi-stage handles this). Rebuild: `docker compose build --no-cache app`.

- **Port already in use**  
  Change host ports in `docker-compose.yml` (e.g. `5434:5432` for Postgres) and `.env` accordingly.