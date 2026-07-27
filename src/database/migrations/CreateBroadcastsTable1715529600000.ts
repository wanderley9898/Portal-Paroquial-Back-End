import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export class CreateBroadcastsTable1715529600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema =
      (queryRunner.connection.options as PostgresConnectionOptions).schema ??
      'public';

    await queryRunner.createSchema(schema, true);
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    const hasBroadcastsTable = await queryRunner.hasTable('broadcasts');

    if (!hasBroadcastsTable) {
      await queryRunner.createTable(
        new Table({
          name: 'broadcasts',
          schema,
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              default: 'uuid_generate_v4()',
            },
            {
              name: 'created_at',
              type: 'timestamptz',
              default: 'CURRENT_TIMESTAMP',
            },
            {
              name: 'updated_at',
              type: 'timestamptz',
              default: 'CURRENT_TIMESTAMP',
            },
            {
              name: 'deleted_at',
              type: 'timestamptz',
              isNullable: true,
            },
            {
              name: 'title',
              type: 'varchar',
              length: '150',
            },
            {
              name: 'description',
              type: 'text',
              isNullable: true,
            },
            {
              name: 'youtubeUrl',
              type: 'varchar',
              length: '255',
            },
            {
              name: 'thumbnail',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'status',
              type: 'enum',
              enumName: 'broadcast_status_enum',
              enum: ['live', 'upcoming', 'past'],
              default: "'upcoming'",
            },
            {
              name: 'scheduledAt',
              type: 'timestamptz',
            },
            {
              name: 'featured',
              type: 'boolean',
              default: false,
            },
            {
              name: 'published',
              type: 'boolean',
              default: true,
            },
            {
              name: 'views',
              type: 'int',
              default: 0,
            },
            {
              name: 'author_id',
              type: 'uuid',
            },
          ],
        }),
      );

      await queryRunner.createIndex(
        'broadcasts',
        new TableIndex({
          name: 'IDX_broadcasts_title',
          columnNames: ['title'],
        }),
      );

      await queryRunner.createForeignKey(
        'broadcasts',
        new TableForeignKey({
          columnNames: ['author_id'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasBroadcastsTable = await queryRunner.hasTable('broadcasts');

    if (hasBroadcastsTable) {
      const table = await queryRunner.getTable('broadcasts');

      const foreignKeys =
        table?.foreignKeys.filter((fk) =>
          fk.columnNames.includes('author_id'),
        ) ?? [];

      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('broadcasts', foreignKey);
      }

      await queryRunner.dropIndex('broadcasts', 'IDX_broadcasts_title');

      await queryRunner.dropTable('broadcasts');
    }

    await queryRunner.query('DROP TYPE IF EXISTS "broadcast_status_enum"');
  }
}
