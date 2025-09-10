import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health/health.controller';
import { UsersModule } from './modules/users';
import { AuthModule } from './modules/auth/auth.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import configuration from './config/configuration.config';
import { Utils } from './modules/global-utilities/utils';
import { GlobalUtilitiesModule } from './modules/global-utilities/global-utilities.module';
import { AuthenticationGuard } from './common/guards/authentiation.guard';
import { MailService } from './utilities/mailer-service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local' ],
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: config.get<'postgres'>('db.type'),
        host: config.get<string>('db.host'),
        port: config.get<number>('db.port'),
        username: config.get<string>('db.username'),
        password: config.get<string>('db.password'),
        database: config.get<string>('db.database'),
        synchronize: config.get<boolean>('db.synchronize'),
        migrationsRun: config.get<boolean>('db.migrationsRun'),
        logging: config.get<boolean>('db.logging'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
      }),
      inject: [ConfigService],
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({ 
        secret: config.get<string>('jwt.secret'),
        signOptions: {expiresIn: config.get<string>('jwt.expiresIn')}
      }),
      global: true,
      inject: [ConfigService],
    }),

    UsersModule,
    AuthModule,
    GlobalUtilitiesModule,
  ],
  controllers: [HealthController],
  providers: [Utils, AuthenticationGuard, MailService],
})
export class AppModule {}
