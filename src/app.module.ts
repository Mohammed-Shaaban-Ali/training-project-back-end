import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health/health.controller';
import { createTypeOrmConfig } from './config/database.config';
import { UsersModule } from './modules/users';
import { SchoolTypesModule } from './modules/education-structure/school-types/school-types.module';
import { EducationTypesModule } from './modules/education-structure/education-types/education-types.module';

@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database module
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: createTypeOrmConfig,
      inject: [ConfigService],
    }),

    // Feature modules
    UsersModule,

    // education structure
    SchoolTypesModule,
    EducationTypesModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
