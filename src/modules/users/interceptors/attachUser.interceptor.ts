

import {Logger, Global, Injectable, CallHandler, ExecutionContext, NestInterceptor} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UsersService } from '../users.service';

@Injectable()
export class AttachUserInterceptor implements NestInterceptor {

  private readonly logger =  new Logger(AttachUserInterceptor.name);

  constructor( private readonly userService: UsersService) {}
  async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
    
    const request = context.switchToHttp().getRequest();

    // console.log('---userId:', request.userId);
    if (request?.userId) {
      const userId = request?.userId;
      const select = ['id', 'email', 'name', 'role', 'phone', 'teacher_id'];
      // console.log('---userId2:', +userId);

      const user = await this.userService.findOne(+userId, select);

      // console.log('--user--');
      // console.log(user);
      this.logger.log('Logged user  data');
      this.logger.log(JSON.stringify(user))
      request.user = user;
    }

    return next.handle();

  }
}