import { Schema, SchemaFactory } from "@nestjs/mongoose";


@Schema()
export class LessonCompletion {

}


export const lessonCompletionSchema = SchemaFactory.createForClass(LessonCompletion);