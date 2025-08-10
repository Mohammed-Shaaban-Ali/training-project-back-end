import { Schema, SchemaFactory } from "@nestjs/mongoose";



@Schema()
export class User {

}


export const userSchema = SchemaFactory.createForClass(User);