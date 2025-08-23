import { Module } from "@nestjs/common";
import { User, userSchema } from "./users.schema";
import { UserController } from "./users.controller";




@Module({
  imports: [
  ],
  controllers: [UserController],
  providers: [],
})
export class UserModule{}