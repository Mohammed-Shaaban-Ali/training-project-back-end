import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const createTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: configService.get<string>('DB_TYPE') as any,
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_DATABASE'),

  // Entity and migration paths
entities: [__dirname + '/../modules/**/*.entity.{ts,js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],

  // Migration settings
  migrationsRun: configService.get<boolean>('TYPEORM_MIGRATIONS_RUN'),

  // Development settings
  synchronize: configService.get<boolean>('TYPEORM_SYNCHRONIZE'),
  logging: configService.get<boolean>('TYPEORM_LOGGING'),

  // Connection pool settings
  extra: {
    connectionLimit: 10,
  },

  // Retry connection
  retryAttempts: 3,
  retryDelay: 3000,
});
