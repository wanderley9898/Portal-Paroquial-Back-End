import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

type MockedDataSource = {
  initialize: any;
  runMigrations: any;
  undoLastMigration: any;
  showMigrations: any;
  destroy: any;
  options: {
    host?: string;
    port?: number;
    database?: string;
    type?: string;
    schema?: string;
  };
};

function createDataSourceMock(): MockedDataSource {
  return {
    initialize: jest.fn(),
    runMigrations: jest.fn(),
    undoLastMigration: jest.fn(),
    showMigrations: jest.fn(),
    destroy: jest.fn(),
    options: {
      host: 'localhost',
      port: 5432,
      database: 'dev-database',
      type: 'postgres',
      schema: 'public',
    },
  };
}

describe('migrate.ts', () => {
  const originalArgv = [...process.argv];
  const originalEnv = { ...process.env };

  let logSpy: jest.SpiedFunction<typeof console.log>;
  let warnSpy: jest.SpiedFunction<typeof console.warn>;
  let errorSpy: jest.SpiedFunction<typeof console.error>;
  let exitSpy: jest.SpiedFunction<typeof process.exit>;

  beforeEach(() => {
    jest.resetModules();
    process.argv = [...originalArgv];
    process.env = { ...originalEnv };
    process.env.DB_CONNECT_RETRIES = '1';
    process.env.DB_CONNECT_RETRY_DELAY_MS = '0';

    logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    exitSpy = jest
      .spyOn(process, 'exit')
      .mockImplementation((() => undefined) as never);
  });

  afterEach(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
    exitSpy.mockRestore();
    process.argv = [...originalArgv];
    process.env = { ...originalEnv };
  });

  it('executa comando run e lista migrations aplicadas', async () => {
    const appDataSource = createDataSourceMock();
    appDataSource.runMigrations.mockResolvedValue([
      { name: 'CreateUsersTable' },
      { name: 'CreateSchoolsTable' },
    ]);
    appDataSource.initialize.mockResolvedValue(undefined);
    appDataSource.destroy.mockResolvedValue(undefined);

    jest.doMock('./data-source', () => ({ AppDataSource: appDataSource }));
    const { main } = await import('./migrate');

    await main('run');

    expect(appDataSource.initialize).toHaveBeenCalledTimes(1);
    expect(appDataSource.runMigrations).toHaveBeenCalledWith({
      transaction: 'each',
    });
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'Banco: postgres | localhost:5432/public/dev-database',
      ),
    );
    expect(logSpy).toHaveBeenCalledWith('Migrations executadas: 2');
    expect(logSpy).toHaveBeenCalledWith('- CreateUsersTable');
    expect(logSpy).toHaveBeenCalledWith('- CreateSchoolsTable');
    expect(appDataSource.destroy).toHaveBeenCalledTimes(1);
  });

  it('executa comando revert e desfaz a ultima migration', async () => {
    const appDataSource = createDataSourceMock();
    appDataSource.initialize.mockResolvedValue(undefined);
    appDataSource.undoLastMigration.mockResolvedValue(undefined);
    appDataSource.destroy.mockResolvedValue(undefined);

    jest.doMock('./data-source', () => ({ AppDataSource: appDataSource }));
    const { main } = await import('./migrate');

    await main('revert');

    expect(warnSpy).toHaveBeenCalledWith(
      'ATENCAO: revert desfaz apenas a ultima migration executada; o down pode alterar ou remover dados.',
    );
    expect(appDataSource.undoLastMigration).toHaveBeenCalledWith({
      transaction: 'each',
    });
    expect(logSpy).toHaveBeenCalledWith('Ultima migration revertida');
    expect(appDataSource.destroy).toHaveBeenCalledTimes(1);
  });

  it('executa comando show e informa se ha migrations pendentes', async () => {
    const appDataSource = createDataSourceMock();
    appDataSource.initialize.mockResolvedValue(undefined);
    appDataSource.showMigrations.mockResolvedValue(true);
    appDataSource.destroy.mockResolvedValue(undefined);

    jest.doMock('./data-source', () => ({ AppDataSource: appDataSource }));
    const { main } = await import('./migrate');

    await main('show');

    expect(appDataSource.showMigrations).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith('Pendentes: sim');
    expect(appDataSource.destroy).toHaveBeenCalledTimes(1);
  });

  it('mostra instrucoes e encerra com codigo 1 para comando invalido', async () => {
    const appDataSource = createDataSourceMock();

    jest.doMock('./data-source', () => ({ AppDataSource: appDataSource }));
    const { main } = await import('./migrate');

    await main('comando-invalido');

    expect(logSpy).toHaveBeenCalledWith('Uso:');
    expect(logSpy).toHaveBeenCalledWith('  npm run migration:run');
    expect(logSpy).toHaveBeenCalledWith('  npm run migration:revert');
    expect(logSpy).toHaveBeenCalledWith('  npm run migration:show');
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(appDataSource.initialize).not.toHaveBeenCalled();
  });

  it('faz retry de conexao antes de executar a migration', async () => {
    const appDataSource = createDataSourceMock();
    appDataSource.initialize
      .mockRejectedValueOnce(new Error('db offline'))
      .mockResolvedValueOnce(undefined);
    appDataSource.runMigrations.mockResolvedValue([]);
    appDataSource.destroy.mockResolvedValue(undefined);
    process.env.DB_CONNECT_RETRIES = '2';
    process.env.DB_CONNECT_RETRY_DELAY_MS = '0';

    jest.doMock('./data-source', () => ({ AppDataSource: appDataSource }));
    const { main } = await import('./migrate');

    await main('run');

    expect(appDataSource.initialize).toHaveBeenCalledTimes(2);
    expect(warnSpy).toHaveBeenCalledWith(
      'Banco indisponivel (tentativa 1/2). Nova tentativa em 0ms...',
    );
    expect(appDataSource.runMigrations).toHaveBeenCalledTimes(1);
  });

  it('encerra com codigo 1 quando a execucao falha apos retries', async () => {
    const appDataSource = createDataSourceMock();
    const failure = new Error('fatal db error');
    appDataSource.initialize.mockRejectedValue(failure);
    process.env.DB_CONNECT_RETRIES = '1';
    process.env.DB_CONNECT_RETRY_DELAY_MS = '0';

    jest.doMock('./data-source', () => ({ AppDataSource: appDataSource }));
    const { main } = await import('./migrate');

    await expect(main('run')).rejects.toThrow(failure);
    expect(appDataSource.runMigrations).not.toHaveBeenCalled();
    expect(appDataSource.destroy).not.toHaveBeenCalled();
  });
});
