# Portal Paroquial - Backend

API backend do Portal Web da Paróquia, desenvolvido com **NestJS**, **TypeORM** e **PostgreSQL**.

Um portal moderno e responsivo para aproximar a comunidade da paróquia, centralizando informações, transmissões ao vivo, conteúdos religiosos, documentos, agenda de eventos e canais de comunicação.

## 🛠️ Tecnologias

| Camada             | Tecnologia     |
| ------------------ | -------------- |
| **Framework**      | NestJS         |
| **Runtime**        | Node.js 20+    |
| **Linguagem**      | TypeScript     |
| **Banco de Dados** | PostgreSQL     |
| **ORM**            | TypeORM        |
| **Autenticação**   | JWT            |
| **Armazenamento**  | AWS S3 / Local |
| **Hospedagem**     | Docker         |

## Arquitetura do Projeto

### Estrutura de Módulos

```
src/
├── @types/              # Tipos e interfaces globais
├── config/              # Configurações (Multer, S3, etc)
├── data/                # Dados estáticos
├── database/            # Configuração do banco de dados e migrations
├── decorators/          # Decoradores customizados
├── entities/            # Modelos de banco de dados
├── guards/              # Guards de autenticação e autorização
├── helpers/             # Funções auxiliares
├── interceptors/        # Interceptadores HTTP
├── middleware/          # Middlewares customizados
├── modules/             # Módulos da aplicação
│   ├── auth/            # Autenticação e login
│   ├── mailer/          # Envio de emails
│   ├── support/         # Tickets e mensagens de suporte
│   └── user/            # Gerenciamento de usuários
├── scripts/             # Scripts de utilitários
├── seeds/               # População inicial de dados
├── services/            # Serviços (ex: AWS S3)
├── templates/           # Templates de emails
├── utils/               # Utilitários gerais
└── main.ts              # Ponto de entrada da aplicação
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

## Autenticação e Permissões

O sistema utiliza **JWT** para autenticação e suporta **múltiplos perfis de usuário**:

- **Admin**: Acesso total ao sistema
- **Editor**: Gerencia notícias e conteúdo público
- **Secretaria**: Gerencia agenda e dados administrativos
- **Comunicação**: Gerencia rádio, transmissões e marketing

## Requisitos

- Node.js `20.19.2` ou compatível com Node 20
- npm
- Docker e Docker Compose, para subir o PostgreSQL local

## Funcionalidades Principais

### 🌐 Área Pública

- Página inicial com notícias e celebrações
- Notícias da paróquia (com suporte a imagens, vídeos, galerias)
- Agenda paroquial (calendário de missas, novenas, eventos)
- Transmissões ao vivo (integração YouTube)
- Canal da paróquia e rádio online
- Bíblia online (leitura diária e pesquisa)
- Liturgia diária (evangelho, leituras, santo do dia)
- Biblioteca de documentos (PDFs organizados)
- Galeria (fotos e vídeos de eventos)
- Pedidos de oração
- Informações de contato e localização
- Compartilhamento em redes sociais

### 🔐 Área Administrativa

- Dashboard com estatísticas gerais
- Gerenciamento de notícias (CRUD + agendamento)
- Gerenciamento de agenda e eventos
- Gerenciamento de transmissões e rádio
- Gerenciamento de PDFs e galerias
- Visualização e moderação de pedidos de oração
- Cadastro de usuários com 4 perfis (Admin, Editor, Secretaria, Comunicação)

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

## Variáveis de Ambiente

### Variáveis Principais

```env
# Ambiente
NODE_ENV=development
PORT=3333
API_KEY=

# Banco de Dados
DATABASE_HOST=localhost
DATABASE_NAME=dev-database
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=
DATABASE_SCHEMA=novels
DATABASE_SSL=false

# Autenticação JWT
JWT_SECRET=your-secret-key-here
ACCESS_TOKEN_VALIDITY_DURATION_IN_DAYS=30d

# Usuário padrão (seed)
SET_USER_EMAIL=admin@gmail.com
SET_USER_DOCUMENT=123.456.789-09
SET_USER_NAME=Admin
SET_USER_PASSWORD=12345678
```

### Variáveis Opcionais

```env
# Inicialização
RUN_SEED_ON_START=false

# Banco de Dados
DB_CONNECT_RETRIES=10
DB_CONNECT_RETRY_DELAY_MS=800

# Logs
LOG_VERBOSE_REQUESTS=false
LOG_INCLUDE_CLIENT_META=false

# Autenticação Social (Opcional)
SOCIAL_MEDIA_SECRET_AUTH=

# Email (Opcional)
MAIL_USER=
MAIL_PASS=

# Armazenamento de Arquivos - AWS S3 (Opcional)
AWS_S3_BUCKET_REGION=
AWS_S3_BUCKET_NAME=
AWS_S3_ACCESS_KEY_ID=
AWS_S3_SECRET_ACCESS_KEY=
AWS_S3_FOLDER=uploads

# Integrações (Opcional)
YOUTUBE_API_KEY=
```

**Nota:** Se as variáveis da AWS S3 não forem configuradas, uploads continuam usando a configuração local padrão do Multer.

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

## 🗺️ Roadmap - Próximas Melhorias

- [ ] App Android/iOS nativo
- [ ] Doações online (PIX e cartão de crédito)
- [ ] Catequese online
- [ ] Formação EAD (vídeo-aulas)
- [ ] Podcast da paróquia
- [ ] Rádio 24 horas
- [ ] Chat de atendimento ao vivo
- [ ] Integração WhatsApp
- [ ] Sistema de voluntários
- [ ] Agendamento de confissões
- [ ] Análise de dados e relatórios

## 📞 Contato e Suporte

Para reportar bugs, fazer sugestões ou contribuir, abra uma issue no repositório.

## 📄 Licença

Veja o arquivo [LICENSE](LICENSE) para detalhes.
