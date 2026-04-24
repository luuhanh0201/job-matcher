import 'reflect-metadata';
import * as path from 'node:path';
import { DataSource } from 'typeorm';

const envFilePath = path.resolve(process.cwd(), '.env.development');
if (typeof process.loadEnvFile === 'function') {
  process.loadEnvFile(envFilePath);
}

const isSslEnabled = String(process.env.DB_SSL ?? 'false') === 'true';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE ?? process.env.DB_NAME,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  ssl: isSslEnabled ? { rejectUnauthorized: false } : false,
  entities: ['src/**/*.entity.ts', 'dist/**/*.entity.js'],
  migrations: ['src/migrations/*.ts', 'dist/migrations/*.js'],
});
