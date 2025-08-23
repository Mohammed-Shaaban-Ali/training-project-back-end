import { Module } from '@nestjs/common';
import { UserModule } from './modules/users/users.modules';
import { CourseModule } from './modules/courses/courses.module';
import { PaymentModule } from './modules/payments/payments.module';
import { LessonModule } from './modules/lessons/lessons.module';
import { LessonCompletionModule } from './modules/lessonCompletion/lessonCompletion.module';

@Module({
  imports: [
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
