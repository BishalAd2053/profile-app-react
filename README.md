# Personal Profile Site

React frontend + Spring Boot backend, fully containerized with Docker Compose.

## Stack

- **Frontend**: React 18 + Vite, served by Nginx (which also proxies `/api/*` to the backend)
- **Backend**: Spring Boot 3.3 (Java 21) — REST endpoints `/api/profile` and `/api/contact`
- **Orchestration**: Docker Compose

## Run locally

You only need Docker installed.

```bash
docker compose up --build
```

Then open: http://localhost:8081

The backend is also exposed directly on http://localhost:8080 for debugging:

- `GET  http://localhost:8080/api/profile`
- `POST http://localhost:8080/api/contact` (JSON: `{ "name", "email", "message" }`)
- `GET  http://localhost:8080/actuator/health`

## Stop

```bash
docker compose down
```

## Project structure

```
personal-profile/
├── backend/               Spring Boot app
│   ├── src/main/java/...
│   ├── pom.xml
│   └── Dockerfile         multi-stage Maven build → JRE runtime
├── frontend/              React + Vite app
│   ├── src/
│   ├── package.json
│   ├── nginx.conf         SPA fallback + /api proxy
│   └── Dockerfile         multi-stage node build → Nginx runtime
└── docker-compose.yml
```
