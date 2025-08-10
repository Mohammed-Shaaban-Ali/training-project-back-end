import { Schema, SchemaFactory } from "@nestjs/mongoose";


@Schema()
export class Payment {

}


export const paymentSchema = SchemaFactory.createForClass(Payment);