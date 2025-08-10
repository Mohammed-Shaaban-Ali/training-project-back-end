import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { LessonCompletion, lessonCompletionSchema } from "./lessonCompletion.schema";


@Module({
  imports: [
    MongooseModule.forFeature([
      {name: LessonCompletion.name, schema: lessonCompletionSchema},
    ])
  ]
})
export class CourseModule {}