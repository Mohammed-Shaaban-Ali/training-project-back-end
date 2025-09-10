import { createParamDecorator, ExecutionContext } from '@nestjs/common';


export const Hostname = createParamDecorator((_d, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return req.hostname || (req.headers.host || '').split(':')[0];
});