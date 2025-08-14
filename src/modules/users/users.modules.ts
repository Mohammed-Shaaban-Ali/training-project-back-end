import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, userSchema } from "./users.schema";
import { UserController } from "./users.controller";




@Module({
  imports: [
    MongooseModule.forFeature([
      {name: User.name, schema: userSchema},
    ])
  ],
  controllers: [UserController],
  providers: [],
})
export class UserModule{}