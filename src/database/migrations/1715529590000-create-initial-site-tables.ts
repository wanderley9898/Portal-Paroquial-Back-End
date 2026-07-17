import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export class CreateInitialSiteTables1715529590000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema =
      (queryRunner.connection.options as PostgresConnectionOptions).schema ??
      'public';

    await queryRunner.createSchema(schema, true);
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    const hasUsersTable = await queryRunner.hasTable('users');
    if (!hasUsersTable) {
      await queryRunner.createTable(
        new Table({
          name: 'users',
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
              name: 'verified',
              type: 'boolean',
              default: true,
              isNullable: true,
            },
            {
              name: 'avatarUrl',
              type: 'varchar',
              isNullable: true,
            },
            {
              name: 'name',
              type: 'varchar',
              length: '255',
            },
            {
              name: 'document',
              type: 'varchar',
              length: '18',
              isNullable: true,
            },
            {
              name: 'email',
              type: 'varchar',
              length: '100',
              isNullable: true,
            },

            {
              name: 'role',
              type: 'enum',
              enumName: 'users_role_enum',
              enum: [
                'super_admin',
                'admin',
                'secretary',
                'communication',
                'editor',
              ],
            },
            {
              name: 'isActive',
              type: 'boolean',
              default: true,
            },
            {
              name: 'phone',
              type: 'varchar',
              length: '20',
              isNullable: true,
            },
            {
              name: 'password',
              type: 'varchar',
              length: '100',
              isNullable: true,
            },
            {
              name: 'isSocialLogin',
              type: 'boolean',
              default: false,
              isNullable: true,
            },
            {
              name: 'terms_accepted_at',
              type: 'timestamptz',
              isNullable: true,
            },
            {
              name: 'privacy_accepted_at',
              type: 'timestamptz',
              isNullable: true,
            },
            {
              name: 'cookies_accepted_at',
              type: 'timestamptz',
              isNullable: true,
            },
            {
              name: 'terms_accepted_version',
              type: 'varchar',
              length: '20',
              isNullable: true,
            },
            {
              name: 'privacy_accepted_version',
              type: 'varchar',
              length: '20',
              isNullable: true,
            },
            {
              name: 'cookies_accepted_version',
              type: 'varchar',
              length: '20',
              isNullable: true,
            },
          ],
        }),
      );

      await queryRunner.createIndex(
        'users',
        new TableIndex({
          name: 'IDX_users_document',
          columnNames: ['document'],
        }),
      );

      await queryRunner.createIndex(
        'users',
        new TableIndex({
          name: 'IDX_users_email',
          columnNames: ['email'],
        }),
      );
    }

    const hasNewsTable = await queryRunner.hasTable('news');
    if (!hasNewsTable) {
      await queryRunner.createTable(
        new Table({
          name: 'news',
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
              name: 'subtitle',
              type: 'varchar',
              length: '200',
              isNullable: true,
            },
            {
              name: 'content',
              type: 'text',
            },
            {
              name: 'coverImage',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'thumbnail',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'category',
              type: 'enum',
              enumName: 'news_category_enum',
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
              default: "'news'",
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
              name: 'publishedAt',
              type: 'timestamptz',
              isNullable: true,
            },
            {
              name: 'expiresAt',
              type: 'timestamptz',
              isNullable: true,
            },
            {
              name: 'youtubeUrl',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'externalUrl',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'tags',
              type: 'varchar',
              length: '1000',
              isNullable: true,
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

      await queryRunner.createForeignKey(
        'news',
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
    const hasNewsTable = await queryRunner.hasTable('news');
    if (hasNewsTable) {
      const newsTable = await queryRunner.getTable('news');
      const newsForeignKeys =
        newsTable?.foreignKeys.filter(
          (foreignKey) => foreignKey.columnNames.indexOf('author_id') !== -1,
        ) ?? [];

      for (const foreignKey of newsForeignKeys) {
        await queryRunner.dropForeignKey('news', foreignKey);
      }

      await queryRunner.dropTable('news');
    }

    const hasUsersTable = await queryRunner.hasTable('users');
    if (hasUsersTable) {
      await queryRunner.dropIndex('users', 'IDX_users_email');
      await queryRunner.dropIndex('users', 'IDX_users_document');
      await queryRunner.dropTable('users');
    }

    await queryRunner.query('DROP TYPE IF EXISTS "news_category_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "users_role_enum"');
  }
}
