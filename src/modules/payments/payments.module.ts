import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Payment, paymentSchema } from "./payments.schema";


@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Payment.name, schema: paymentSchema},
    ])
  ]
})
export class PaymentModule {}