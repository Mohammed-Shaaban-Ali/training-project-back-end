import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Lesson, lessonSchema } from "./lessons.schema";


@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Lesson.name, schema: lessonSchema},
    ])
  ]
})
export class LessonModule {}