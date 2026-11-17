import { QueryRunner } from 'typeorm';

type UuidExtensionSchema = {
  extensionSchema: string;
};

export async function getUuidDefault(
  queryRunner: QueryRunner,
  preferredSchema: string,
): Promise<string> {
  const escapedSchema = preferredSchema.replace(/"/g, '""');
  await queryRunner.query(
    `CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA "${escapedSchema}"`,
  );

  const [extension] = (await queryRunner.query(`
    SELECT namespace.nspname AS "extensionSchema"
    FROM pg_extension
    JOIN pg_namespace namespace ON namespace.oid = pg_extension.extnamespace
    WHERE pg_extension.extname = 'uuid-ossp'
  `)) as UuidExtensionSchema[];

  if (!extension?.extensionSchema) {
    throw new Error('Could not determine the schema containing uuid-ossp.');
  }

  const actualSchema = extension.extensionSchema.replace(/"/g, '""');
  return `"${actualSchema}"."uuid_generate_v4"()`;
}
