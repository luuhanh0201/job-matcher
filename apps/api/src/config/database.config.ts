/* eslint-disable @typescript-eslint/no-unused-vars */
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
  const synchronize =
    String(configService.get('DB_SYNCHRONIZE', { infer: true }) ?? 'false') ===
    'true';
  const searchPath =
    configService.get('DB_SEARCH_PATH', { infer: true }) ?? 'public,extensions';
  return {
    type: 'postgres',
    host: configService.get('DB_HOST', { infer: true }),
    port: parseInt(configService.get('DB_PORT', { infer: true }) as string, 10),
    username,
    password: configService.get('DB_PASSWORD', { infer: true }),
    database,
    autoLoadEntities: true,
    synchronize: synchronize,
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    logging: false,
    ssl: useSsl ? { rejectUnauthorized: false } : false,
    extra: {
      options: `-c search_path=${searchPath}`,
    },
  };
};
