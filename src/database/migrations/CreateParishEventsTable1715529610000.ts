import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export class CreateParishEventsTable1715529610000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema =
      (queryRunner.connection.options as PostgresConnectionOptions).schema ??
      'public';
    const escapedSchema = schema.replace(/"/g, '""');
    await queryRunner.query(
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA "${escapedSchema}"`,
    );
    const uuidDefault = `"${escapedSchema}"."uuid_generate_v4"()`;
    const hasTable = await queryRunner.hasTable('parish_events');

    if (hasTable) return;

    await queryRunner.createTable(
      new Table({
        name: 'parish_events',
        schema,
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: uuidDefault },
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
          { name: 'deleted_at', type: 'timestamptz', isNullable: true },
          { name: 'name', type: 'varchar', length: '150' },
          { name: 'description', type: 'text' },
          { name: 'date', type: 'date' },
          { name: 'time', type: 'varchar', length: '5' },
          { name: 'endTime', type: 'varchar', length: '5', isNullable: true },
          { name: 'location', type: 'varchar', length: '255' },
          { name: 'responsible', type: 'varchar', length: '150' },
          {
            name: 'category',
            type: 'enum',
            enumName: 'parish_event_category_enum',
            enum: [
              'news',
              'notice',
              'event',
              'novena',
              'mass',
              'campaign',
              'community',
              'pastoral',
              'catechesis',
              'youth',
              'charity',
              'liturgy',
              'formation',
              'other',
            ],
          },
          { name: 'image', type: 'varchar', length: '255', isNullable: true },
          { name: 'views', type: 'int', default: 0 },
        ],
      }),
    );

    await queryRunner.createIndex(
      'parish_events',
      new TableIndex({ name: 'IDX_parish_events_name', columnNames: ['name'] }),
    );
    await queryRunner.createIndex(
      'parish_events',
      new TableIndex({ name: 'IDX_parish_events_date', columnNames: ['date'] }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('parish_events')) {
      await queryRunner.dropTable('parish_events');
    }
    await queryRunner.query('DROP TYPE IF EXISTS "parish_event_category_enum"');
  }
}
