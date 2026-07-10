# LoreForge Back

API backend do LoreForge, criada com NestJS, TypeORM e PostgreSQL.

## Requisitos

- Node.js `20.19.2` ou compatível com Node 20
- npm
- Docker e Docker Compose, para subir o PostgreSQL local

## Instalação

Instale as dependências:

```bash
npm ci
```

Crie o arquivo de ambiente a partir do exemplo:

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

## Banco de Dados

Suba o PostgreSQL local:

```bash
docker compose up -d
```

As credenciais padrão do banco estão em `.env.example` e batem com o `docker-compose.yml`.

Execute as migrations:

```bash
npm run migration:run
```

Para conferir migrations pendentes:

```bash
npm run migration:show
```

Para reverter a última migration:

```bash
npm run migration:revert
```

## Seeds

Para popular dados iniciais:

```bash
npm run seed:run
```

Também é possível rodar seed ao iniciar a aplicação definindo no `.env`:

```env
RUN_SEED_ON_START=true
```

## Rodando Localmente

Inicie a API em modo desenvolvimento:

```bash
npm run start:dev
```

Por padrão a aplicação sobe em:

```text
http://localhost:3333
```

A documentação Swagger fica em:

```text
http://localhost:3333/docs
```

## Scripts Úteis

```bash
npm run start:dev      # inicia com watch
npm run start:debug    # inicia com debug e watch
npm run build:prod     # gera build de produção
npm run start:prod     # executa dist/main
npm run lint           # roda eslint com --fix
npm run format         # formata arquivos TS com Prettier
npm run test           # executa testes
```

## Variáveis de Ambiente

Principais variáveis usadas pela aplicação:

```env
NODE_ENV=development
PORT=3333
API_KEY=

DATABASE_HOST=localhost
DATABASE_NAME=dev-database
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=
DATABASE_SCHEMA=novels
DATABASE_SSL=false

JWT_SECRET=
ACCESS_TOKEN_VALIDITY_DURATION_IN_DAYS=30d

SET_USER_EMAIL=admin@gmail.com
SET_USER_DOCUMENT=123.456.789-09
SET_USER_NAME=Admin
SET_USER_PASSWORD=12345678
```

Variáveis opcionais:

```env
RUN_SEED_ON_START=false
DB_CONNECT_RETRIES=10
DB_CONNECT_RETRY_DELAY_MS=800
LOG_VERBOSE_REQUESTS=false
LOG_INCLUDE_CLIENT_META=false
SOCIAL_MEDIA_SECRET_AUTH=
MAIL_USER=
MAIL_PASS=
AWS_S3_BUCKET_REGION=
AWS_S3_BUCKET_NAME=
AWS_S3_ACCESS_KEY_ID=
AWS_S3_SECRET_ACCESS_KEY=
AWS_S3_FOLDER=uploads
```

Se as variáveis da AWS S3 não forem configuradas, uploads continuam usando a configuração local padrão do Multer.

## Build de Produção

Gere o build:

```bash
npm run build:prod
```

Execute migrations em produção, quando necessário:

```bash
npm run migration:run:prod
```

Inicie a aplicação compilada:

```bash
npm run start:prod
```

## Fluxo Rápido

```bash
npm ci
cp .env.example .env
docker compose up -d
npm run migration:run
npm run seed:run
npm run start:dev
```

Depois acesse `http://localhost:3333/docs`.
