# Portal Paroquial - Backend

API backend do Portal Paroquial desenvolvida com NestJS, TypeORM e PostgreSQL.

Este repositório concentra a camada de serviços da aplicação: autenticação, gestão de usuários, notícias, transmissões e integração com e-mails e armazenamento de arquivos.

## Tecnologias

| Camada         | Tecnologia                               |
| -------------- | ---------------------------------------- |
| Framework      | NestJS                                   |
| Runtime        | Node.js 20+                              |
| Linguagem      | TypeScript                               |
| Banco de dados | PostgreSQL                               |
| ORM            | TypeORM                                  |
| Autenticação   | JWT + Passport                           |
| Armazenamento  | RustFS (API compatível com S3) ou armazenamento em memória via Multer |
| Documentação   | Swagger                                  |
| Containers     | Docker Compose                           |

## Estrutura principal do projeto

```text
src/
├── config/              # Configurações globais (env, multer, S3)
├── database/            # Configuração do TypeORM e migrations
├── decorators/          # Decoradores customizados
├── entities/            # Entidades do banco de dados
├── guards/              # Guards de autenticação/autorização
├── helpers/             # Helpers utilitários
├── middleware/          # Middlewares HTTP
├── modules/             # Módulos da aplicação
│   ├── auth/            # Login, cadastro, autenticação e verificação de código
│   ├── broadcast/       # Gerenciamento de transmissões/broadcasts
│   ├── mailer/          # Envio de e-mails
│   ├── news/            # Gestão de notícias
│   └── user/            # Usuários e administração
├── seeds/               # Seed inicial para popular dados
├── services/            # Serviços externos (ex.: S3)
├── utils/               # Utilitários gerais
└── main.ts              # Ponto de entrada da aplicação
```

## Módulos atuais

- Auth: login, registro, login social, geração/verificação de código e proteção por JWT.
- User: cadastro e gerenciamento de usuários, incluindo fluxo administrativo.
- News: CRUD de notícias e conteúdo editorial.
- Broadcast: gestão de transmissões e conteúdos de broadcast.
- Mailer: envio de e-mails transacionais.

## Requisitos

- Node.js 20+
- npm
- Docker e Docker Compose para subir o PostgreSQL local

## Variáveis de ambiente

O projeto usa configurações carregadas via arquivo de ambiente. Crie um arquivo .env com base no seu ambiente local.

Exemplo de variáveis principais:

```env
NODE_ENV=development
PORT=3333

DATABASE_HOST=localhost
DATABASE_NAME=dev-database
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-password
DATABASE_SCHEMA=public

JWT_SECRET=your-secret-key
ACCESS_TOKEN_VALIDITY_DURATION_IN_DAYS=30d

RUN_SEED_ON_START=false
```

Outras variáveis opcionais podem incluir configurações de e-mail, RustFS/S3 e autenticação social, conforme a necessidade do ambiente.

## Como executar localmente

1. Instale as dependências:

```bash
npm ci
```

2. Suba o banco PostgreSQL:

```bash
docker compose up -d
```

3. Execute as migrations:

```bash
npm run migration:run
```

4. Opcionalmente, rode os seeds iniciais:

```bash
npm run seed:run
```

5. Inicie a aplicação em modo desenvolvimento:

```bash
npm run start:dev
```

A aplicação ficará disponível em:

```text
http://localhost:3333
```

A documentação Swagger estará em:

```text
http://localhost:3333/docs
```

## Scripts disponíveis

```bash
npm run start:dev        # inicia com watch
npm run start:debug      # inicia com debug e watch
npm run build:dev        # build usando env-cmd
npm run build:prod       # build de produção
npm run start:prod       # executa a build compilada
npm run migration:run    # executa migrations
npm run migration:revert # reverte a última migration
npm run migration:show   # mostra migrations aplicadas
npm run seed:run         # executa os seeds
npm run test             # executa os testes
npm run lint             # executa eslint com correção automática
```

## Banco de dados

O projeto utiliza TypeORM com PostgreSQL. As migrations ficam em:

```text
src/database/migrations
```

Para rodar as migrations manualmente:

```bash
npm run migration:run
```

## Observações importantes

- A integração de arquivos usa a API S3 compatível do RustFS. Configure `S3_ENDPOINT`, `S3_ACCESS_KEY` e `S3_SECRET_KEY` com uma Service Account IAM da aplicação; sem essas variáveis, o Multer mantém o armazenamento em memória local.
- `S3_PUBLIC_URL` é opcional. Configure-a somente quando a URL pública dos objetos for diferente do endpoint S3; o valor deve ser a raiz acessível externamente, sem o nome do bucket.
- O seed pode ser disparado automaticamente ao iniciar a aplicação quando a variável RUN_SEED_ON_START estiver definida como true.
- A aplicação já inclui Swagger para facilitar a exploração dos endpoints durante o desenvolvimento.

## Licença

Consulte o arquivo LICENSE para detalhes.
