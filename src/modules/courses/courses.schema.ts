import { Schema, SchemaFactory } from "@nestjs/mongoose";


@Schema()
export class Course {

}


export const courseSchema = SchemaFactory.createForClass(Course);