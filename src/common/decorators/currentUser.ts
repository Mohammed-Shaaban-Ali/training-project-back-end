
import {createParamDecorator, ExecutionContext} from '@nestjs/common';
import { User } from 'src/modules/users';


export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined , context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    const user = request.user as User | undefined;
      
    // data here refer to any field in the user row, if you need to get only a certain field not the full row
    return data ? user?.[data] : user;

  }
)