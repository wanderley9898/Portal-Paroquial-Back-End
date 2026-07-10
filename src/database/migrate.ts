import { AppDataSource } from './data-source';

export async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function initializeWithRetry() {
  const maxAttempts = Number(process.env.DB_CONNECT_RETRIES ?? 10);
  const baseDelayMs = Number(process.env.DB_CONNECT_RETRY_DELAY_MS ?? 800);

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await AppDataSource.initialize();
      return;
    } catch (error) {
      lastError = error;
      const delay = Math.min(baseDelayMs * attempt, 5000);
      console.warn(
        `Banco indisponível (tentativa ${attempt}/${maxAttempts}). Nova tentativa em ${delay}ms...`,
      );
      await sleep(delay);
    }
  }

  throw lastError;
}

export function logConnectionInfo() {
  const options = AppDataSource.options as {
    host?: string;
    port?: number;
    database?: string;
    type?: string;
    schema?: string;
  };

  const nodeEnv = process.env.NODE_ENV ?? 'development';

  console.log(
    `Banco: ${options.type ?? 'postgres'} | ${options.host ?? '?'}:${options.port ?? '?'}${options.schema ? `/${options.schema}` : ''}/${options.database ?? '?'} (NODE_ENV=${nodeEnv})`,
  );
}

export async function run() {
  await initializeWithRetry();
  logConnectionInfo();

  try {
    const migrations = await AppDataSource.runMigrations({
      transaction: 'each',
    });

    console.log(`Migrations executadas: ${migrations.length}`);
    for (const migration of migrations) {
      console.log(`- ${migration.name}`);
    }
  } finally {
    await AppDataSource.destroy();
  }
}

export async function revert() {
  await initializeWithRetry();
  logConnectionInfo();

  console.warn(
    'ATENÇÃO: revert desfaz apenas a ultima migration executada; o down pode alterar ou remover dados.',
  );

  try {
    await AppDataSource.undoLastMigration({ transaction: 'each' });
    console.log('Ultima migration revertida');
  } finally {
    await AppDataSource.destroy();
  }
}

export async function show() {
  await initializeWithRetry();
  logConnectionInfo();

  try {
    const hasPending = await AppDataSource.showMigrations();
    console.log(`Pendentes: ${hasPending ? 'sim' : 'nao'}`);
  } finally {
    await AppDataSource.destroy();
  }
}

export async function main(
  command = String(process.argv[2] ?? '').toLowerCase(),
) {
  if (command === 'run') return run();
  if (command === 'revert') return revert();
  if (command === 'show') return show();

  console.log('Uso:');
  console.log('  npm run migration:run');
  console.log('  npm run migration:revert');
  console.log('  npm run migration:show');
  process.exit(1);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Falha ao executar migration:', error);
    process.exit(1);
  });
}
