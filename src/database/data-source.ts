import 'reflect-metadata';

import configuration from 'src/config/configuration';
import { DataSource } from 'typeorm';

const config = configuration();
const nodeEnv = process.env.NODE_ENV ?? 'development';
const isProduction = nodeEnv === 'production';
const requireSSL =
  String(process.env.DATABASE_SSL ?? '').toLowerCase() === 'true';
const enableSSL = isProduction || requireSSL;

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.databaseName,
  schema: config.database.schema,
  synchronize: false,
  ssl: enableSSL ? { rejectUnauthorized: false } : false,
  extra: enableSSL
    ? {
        client_encoding: 'UTF8',
        ssl: { rejectUnauthorized: false },
      }
    : {
        client_encoding: 'UTF8',
      },
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
});
