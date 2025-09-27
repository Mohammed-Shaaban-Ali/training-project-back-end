

import {Logger, Injectable, CallHandler, ExecutionContext, NestInterceptor} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UsersService } from '../users.service';
import {Reflector} from '@nestjs/core';
import { IS_PUBLIC_KEY, SKIP_ATTACH_LOGGED_USER } from 'src/common/decorators';
import { UserKeys } from '../types';

@Injectable()
export class AttachUserInterceptor implements NestInterceptor {

  private readonly logger =  new Logger(AttachUserInterceptor.name);

  constructor( 
    private readonly userService: UsersService,
    private readonly reflector: Reflector,
  ) {}
  async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
    

    const isPublicRoute = this.reflector.getAllAndOverride<boolean> (IS_PUBLIC_KEY, [
      context.getHandler,
      context.getClass,
    ])


    const isSkipAttachLoggedUser = this.reflector.getAllAndOverride<boolean>(SKIP_ATTACH_LOGGED_USER, [
      context.getHandler,
      context.getClass,
    ]);


    // if the route is 'public' or we use the 'SkipAttachLoggedUser' then do not do anything.
    if (isPublicRoute || isSkipAttachLoggedUser) return next.handle(); 

    const request = context.switchToHttp().getRequest();

    if (request?.userId) {
      const userId = request?.userId;
      const select: UserKeys[] = ['id', 'email', 'name', 'role', 'phone', 'teacher_id'];

      const user = await this.userService.findOne({id:+userId}, select);

      this.logger.log('@@@Logged user  data@@@');
      this.logger.log(JSON.stringify(user));

      request.user = user;
    }

    return next.handle();

  }
}