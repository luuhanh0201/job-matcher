import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AllConfigType } from '@/config/config.type';

export const getDatabaseConfig = (
  configService: ConfigService<AllConfigType>,
): TypeOrmModuleOptions => {
  const isDev =
    configService.get('NODE_ENV', { infer: true }) === 'development';

  const username: string | undefined =
    configService.get('DB_USERNAME', { infer: true }) ??
    configService.get('DB_USER', { infer: true });
  const database: string | undefined =
    configService.get('DB_DATABASE', { infer: true }) ??
    configService.get('DB_NAME', { infer: true });
  const useSsl =
    String(configService.get('DB_SSL', { infer: true }) ?? 'false') === 'true';

  return {
    type: 'postgres',
    host: configService.get('DB_HOST', { infer: true }),
    port: parseInt(configService.get('DB_PORT', { infer: true }) as string, 10),
    username,
    password: configService.get('DB_PASSWORD', { infer: true }),
    database,
    autoLoadEntities: true,
    synchronize: false,
    entities: ['src/**/*.entity.ts'],
    migrations: ['src/migrations/*.ts'],
    logging: isDev,
    ssl: useSsl ? { rejectUnauthorized: false } : false,
  };
};
