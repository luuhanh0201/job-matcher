import { DataSource } from 'typeorm';

const REQUIRED_EXTENSIONS = ['uuid-ossp', 'unaccent', 'vector'] as const;

const extensionInstallHint =
  'Postgres server must have postgresql-contrib and pgvector installed. ' +
  'For local Docker, use the pgvector/pgvector Postgres image from docker-compose.yml. ' +
  'For Supabase/production, enable uuid-ossp, unaccent, and vector extensions, then ensure search_path includes public,extensions.';

export async function ensureDatabasePrerequisites(
  dataSource: DataSource,
): Promise<void> {
  try {
    for (const extension of REQUIRED_EXTENSIONS) {
      await dataSource.query(`CREATE EXTENSION IF NOT EXISTS "${extension}"`);
    }

    await dataSource.query(`SELECT uuid_generate_v4()`);
    await dataSource.query(`SELECT unaccent('Tiếng Việt')`);
    await dataSource.query(
      `SELECT '[1,0,0]'::vector <=> '[1,0,0]'::vector AS distance`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Database prerequisites are not ready: ${message}. ${extensionInstallHint}`,
    );
  }
}
