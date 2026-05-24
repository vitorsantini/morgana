# Morgana — CLAUDE.md

## Visão geral do projeto
Aplicação web pessoal de produtividade. Monorepo com backend NestJS e frontend Angular.
Uso 100% pessoal (single-user), com autenticação própria (JWT + Google OAuth).

## Stack
- **Backend:** NestJS + TypeScript + Prisma + PostgreSQL
- **Frontend:** Angular (standalone components) + TailwindCSS + Angular CDK
- **Auth:** JWT + Refresh Token + Google OAuth
- **Deploy:** Railway
- **Package manager:** npm

## Estrutura do monorepo
```
morgana/
├── backend/          # NestJS + Clean Architecture
├── frontend/         # Angular standalone
├── CLAUDE.md
└── README.md
```

## Arquitetura — Backend (Clean Architecture por módulo)
```
backend/src/modules/<module>/
├── domain/
│   ├── entities/          # Classes de domínio puras (sem framework)
│   └── repositories/      # Interfaces de repositório
├── application/
│   └── use-cases/         # Um arquivo por caso de uso
├── infrastructure/
│   └── repositories/      # Implementações Prisma dos repositórios
└── presentation/
    ├── controllers/
    ├── dtos/
    └── <module>.module.ts
```

## Módulos do backend
- `auth` — JWT, refresh token, Google OAuth, registro/login
- `projects` — CRUD + arquivar projetos
- `columns` — Colunas globais de status
- `tasks` — Tarefas com prioridade e ordem
- `subtasks` — Subtarefas com progresso
- `notes` — Markdown, pastas, tags, templates, linking [[note-title]]
- `habits` — Hábito diário com streak e heatmap
- `goals` — Metas com progresso numérico
- `dashboard` — Resumo do dia/semana
- `settings` — Configurações globais (auto-advance, view preference)

## Arquitetura — Frontend (Angular)
```
frontend/src/app/
├── core/              # Serviços singleton, guards, interceptors
│   ├── auth/
│   ├── guards/
│   └── interceptors/
├── shared/            # Componentes reutilizáveis, pipes, directives
│   └── components/
├── features/          # Feature modules (standalone)
│   ├── auth/
│   ├── dashboard/
│   ├── projects/
│   ├── notes/
│   ├── habits/
│   └── settings/
└── layout/            # Shell, sidebar, header
```

## Convenções de código

### Backend
- Um caso de uso por arquivo, nomeado `<verbo>-<entidade>.use-case.ts`
- Repositórios como interfaces no domínio, implementados na infraestrutura
- Controllers apenas delegam para use cases — sem lógica de negócio
- DTOs com `class-validator` decorators
- Respostas padronizadas via `ResponseDto<T>`
- Erros via `DomainException` extendendo `HttpException`
- Injeção de dependência via tokens (não classes concretas nos módulos de domínio)

### Frontend
- Standalone components em todos os componentes Angular
- Signals para estado local, Services com signals para estado global
- Sem NgModules desnecessários
- Chamadas HTTP centralizadas em services dentro de `core/`
- Interceptor para injetar JWT e fazer refresh automático

## Regras de negócio críticas
- **RN-01:** Colunas são globais — ao criar, adiciona a TODOS os projetos via `ProjectColumn`
- **RN-02:** Projetos podem ocultar colunas (flag `hidden` na `ProjectColumn`)
- **RN-03:** Painel Geral nunca respeita ocultação — sempre exibe todas as colunas
- **RN-04:** Ordem das colunas é global e imutável por projeto
- **RN-08:** Auto-avanço configurável: quando todas subtarefas concluídas, avança status da tarefa
- **Hard delete** para tarefas (decisão do usuário)

## Comandos úteis

### Backend
```bash
cd backend
npm run start:dev          # Dev com hot reload
npm run build              # Build produção
npx prisma migrate dev     # Criar migration
npx prisma migrate deploy  # Aplicar migrations
npx prisma studio          # UI do banco
npx prisma generate        # Gerar client
npm run test               # Testes unitários
npm run test:e2e           # Testes E2E
```

### Frontend
```bash
cd frontend
npm start                  # Dev server (ng serve)
npm run build              # Build produção
npm test                   # Karma/Jest
```

## Variáveis de ambiente — Backend (.env)
```
DATABASE_URL=postgresql://user:pass@host:5432/morgana
JWT_SECRET=<secret>
JWT_REFRESH_SECRET=<secret>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=<id>
GOOGLE_CLIENT_SECRET=<secret>
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
PORT=3000
FRONTEND_URL=http://localhost:4200
```

## Fases de entrega
- **Fase 1:** Auth + Projetos + Colunas + Tarefas + Kanban (DONE)
- **Fase 2:** Subtarefas + View Lista + Preferências de view
- **Fase 3:** Notas com Markdown
- **Fase 4:** Hábitos + Metas + Dashboard + PWA + Dark mode

## Links e referências
- Arquivo de memória detalhada: `C:\Users\santi\.claude\projects\E--workspace-pessoal-morgana\memory\`
- PRD original: `morgana-prd.docx` (Downloads do usuário)
