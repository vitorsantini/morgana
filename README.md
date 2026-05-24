# Morgana

Aplicação web pessoal de produtividade — tarefas por projeto, notas em Markdown e acompanhamento de hábitos e metas.

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | NestJS + TypeScript + Clean Architecture |
| ORM | Prisma |
| Banco | PostgreSQL |
| Frontend | Angular 21 + TailwindCSS + Angular CDK |
| Auth | JWT + Refresh Token + Google OAuth |
| Deploy | Railway |

## Estrutura

```
morgana/
├── backend/   # NestJS API
└── frontend/  # Angular app
```

## Setup

### 1. Configure o banco de dados

Crie um banco PostgreSQL (Railway, Supabase, local, etc.) e configure o `.env`:

```bash
cp backend/.env.example backend/.env
# Edite backend/.env com sua DATABASE_URL e segredos JWT
```

### 2. Execute as migrations

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### 3. Inicie o backend

```bash
cd backend
npm run start:dev
# API disponível em http://localhost:3000/api
# Swagger: http://localhost:3000/api/docs
```

### 4. Inicie o frontend

```bash
cd frontend
npm start
# App em http://localhost:4200
```

## Módulos

- **Tarefas** — Kanban + Lista, colunas globais, subtarefas com progresso, drag-and-drop
- **Notas** — Editor Markdown com preview, pastas, tags, templates, linking `[[nota]]`
- **Hábitos** — Tracker diário, streak, heatmap semanal
- **Metas** — Progresso numérico com barra visual
- **Dashboard** — Resumo do dia (hábitos, tarefas em progresso, metas)

## Variáveis de ambiente (backend)

Veja `backend/.env.example` para lista completa.
