# Todo List + Nextcloud Lab

This repository includes:
- a static todo app Docker image (`Dockerfile`)
- a dynamic todo stack with Node.js, SQLite, and a REST API (`docker-compose.todo.yml`)
- a Docker Compose lab for **Nginx + Nextcloud + MariaDB** (`docker-compose.yml`)

## 1) Dynamic Todo (Node.js + SQLite)

Start the todo stack:

```bash
docker compose -f docker-compose.todo.yml up --build
```

Open the app at [http://localhost:3000](http://localhost:3000).

The UI talks to a REST API backed by SQLite. Todos are stored in `/data/todos.sqlite` inside the container, mounted on the `todo_data` Docker volume — so they survive container restarts and rebuilds.

Stop the stack:

```bash
docker compose -f docker-compose.todo.yml down
```

To remove persisted todos as well, add `-v` to drop the `todo_data` volume.

## 2) Nginx + Nextcloud

Start the stack:

```bash
docker compose up -d
```

Services and URLs:

- Nextcloud via nginx reverse proxy: `http://localhost:8080`
- Nextcloud direct container port (bypasses nginx): `http://localhost:8081`

### Configure Nginx and Nextcloud

- Nginx reverse proxy config: `nextcloud-nginx/default.conf`
- Nextcloud app + DB config: `docker-compose.yml`

### Stop Nginx and test Nextcloud effect

```bash
docker compose stop nextcloud-nginx
```

Validation:

- `http://localhost:8080` should be unavailable (nginx path)
- `http://localhost:8081` should still work (direct Nextcloud container)

Start nginx again:

```bash
docker compose start nextcloud-nginx
```

### Upload and download file in Nextcloud

1. Open `http://localhost:8080` and finish first-time admin setup.
2. Upload a file from the Files page.
3. Download the same file to verify both operations.

## 3) Git/GitHub

Show git version:

```bash
git --version
```

Create a branch:

```bash
git checkout -b chore/nextcloud-nginx-setup
```

Push branch:

```bash
git push -u origin chore/nextcloud-nginx-setup
```

## 4) Docker

- `Dockerfile` — static todo app served by nginx (port 80)
- `api/Dockerfile` — dynamic todo app (Node.js + Express + SQLite, port 3000)
- `docker-compose.todo.yml` — todo stack with persistent `todo_data` volume
- `docker-compose.yml` — Nextcloud lab (nextcloud + mariadb + nginx proxy)

## Project layout

- `index.html` / `styles.css` / `app.js` — todo app UI
- `api/server.js` / `api/db.js` — REST API and SQLite persistence
- `nginx/default.conf` — nginx config for static todo files
- `Dockerfile` — static todo image (nginx Alpine)
- `api/Dockerfile` — dynamic todo image (Node Alpine)
- `docker-compose.todo.yml` — todo stack with SQLite volume
- `docker-compose.yml` — multi-service Nextcloud setup
- `nextcloud-nginx/default.conf` — nginx reverse proxy for Nextcloud
