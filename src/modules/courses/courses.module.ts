import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Course, courseSchema } from "./courses.schema";


@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Course.name, schema: courseSchema}
    ])
  ]
})
export class CourseModule {

}