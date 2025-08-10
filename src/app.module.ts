import { Module } from '@nestjs/common';
import { UserModule } from './modules/users/users.modules';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseModule } from './modules/courses/courses.module';
import { PaymentModule } from './modules/payments/payments.module';
import { LessonModule } from './modules/lessons/lessons.module';
import { LessonCompletionModule } from './modules/lessonCompletion/lessonCompletion.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/LMS'),
    UserModule,
    CourseModule,
    PaymentModule,
    LessonModule,
    CourseModule,
    LessonCompletionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
