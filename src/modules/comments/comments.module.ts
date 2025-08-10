import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Comment, commentSchema } from "./comments.schema";


@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Comment.name, schema: commentSchema},
    ])
  ]
})
export class CourseModule {}