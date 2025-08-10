import { Schema, SchemaFactory } from "@nestjs/mongoose";


@Schema()
export class Comment {

}


export const commentSchema = SchemaFactory.createForClass(Comment);