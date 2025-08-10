import { Schema, SchemaFactory } from "@nestjs/mongoose";


@Schema()
export class Lesson {

}

export const lessonSchema = SchemaFactory.createForClass(Lesson);