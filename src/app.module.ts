import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health/health.controller';
import { UsersModule } from './modules/users';
import { AuthModule } from './modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import configuration from './config/configuration.config';
import { Utils } from './modules/global-utilities/utils';
import { GlobalUtilitiesModule } from './modules/global-utilities/global-utilities.module';
import { AuthenticationGuard } from './common/guards/authentiation.guard';
import { MailService } from './utilities/mailer-service';
import { APP_GUARD, APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { AttachUserInterceptor } from './modules/users/interceptors';
import { SchoolTypesModule } from './modules/education-structure/school-types/school-types.module';
import { EducationTypesModule } from './modules/education-structure/education-types/education-types.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV ?? 'development'}`, '.env.development'],
      load: [configuration],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        PORT: Joi.number().default(3333),
    
        DB_TYPE: Joi.string().valid('postgres').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
    
        TYPEORM_SYNCHRONIZE: Joi.boolean().default(false),
        TYPEORM_MIGRATIONS_RUN: Joi.boolean().default(false),
        TYPEORM_LOGGING: Joi.boolean().default(false),
    
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('2h'),
        REFRESH_TOKEN_EXPIRY_IN: Joi.string().default('7'),
    
        EMAIL_ADDRESS: Joi.string().email().required(),
        EMAIL_PASSWORD: Joi.string().required(),
        EMAIL_PORT_SECURE: Joi.number().required(),
        EMAIL_PORT: Joi.number().required(),
        EMAIL_HOST: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        console.log('NODE_ENV=', process.env.NODE_ENV);
        console.log('DB_HOST=', process.env.DB_HOST);
        console.log('DB_PORT=', process.env.DB_PORT);

        return {
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
        }
      },
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

    // education structure
    SchoolTypesModule,
    EducationTypesModule,
  ],
  controllers: [HealthController],
  providers: [
    Utils, 
    MailService,
    Reflector,
    {provide: APP_GUARD, useClass: AuthenticationGuard},
    {provide: APP_INTERCEPTOR, useClass: AttachUserInterceptor},

  ],
})
export class AppModule {}
