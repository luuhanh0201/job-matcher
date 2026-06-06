import 'reflect-metadata';
import * as path from 'node:path';
import { DataSource } from 'typeorm';

export const envFilePath = path.resolve(
  process.cwd(),
  process.env.NODE_ENV === 'production' ? '.env' : '.env.local',
);
if (typeof process.loadEnvFile === 'function') {
  process.loadEnvFile(envFilePath);
}

const isSslEnabled = String(process.env.DB_SSL ?? 'false') === 'true';
const isTsRuntime = __filename.endsWith('.ts');

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE ?? process.env.DB_NAME,
  synchronize: String(process.env.DB_SYNCHRONIZE ?? 'false') === 'true',
  logging: process.env.NODE_ENV === 'development',
  ssl: isSslEnabled ? { rejectUnauthorized: false } : false,
  entities: [isTsRuntime ? 'src/**/*.entity.ts' : 'dist/**/*.entity.js'],
  migrations: [isTsRuntime ? 'src/migrations/*.ts' : 'dist/migrations/*.js'],
});
