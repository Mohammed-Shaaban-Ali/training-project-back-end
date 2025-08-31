import  { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import {map} from 'rxjs/operators';


export class SuccessResponseInterceptor implements NestInterceptor{

intercept(_: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
  
  return next.handle().pipe(map( data => ({success: true, data})));
}

}