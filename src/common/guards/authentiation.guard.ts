
import {Logger, Global, Injectable, BadRequestException, CanActivate, ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';


@Global()
@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly logger = new Logger(AuthenticationGuard.name);
  constructor(private readonly jwtService: JwtService) {}

  async   canActivate(context: ExecutionContext): Promise<boolean> {
    
    const request = context.switchToHttp().getRequest();

    const token = request.headers.authorization;

    if (!token) {
      throw new BadRequestException('Un authenticated request');
    }

    if (!token.includes('Bearer')) {
      throw new BadRequestException('Invalid Bearer token');
    }

    const accessToken = token.split(' ')[1];

    if (!accessToken){
      throw new BadRequestException('Token not provided');
    }

    const payload = await this.jwtService.verifyAsync(accessToken).catch(error => {
      // console.log('---eeeerrrror', error);
      this.logger.error('Error while verifying jwt token:', error.stack);
      const message = error.message === 'jwt expired' ?  'jwt expired' : 'Internal server error';
      throw new InternalServerErrorException(message);
    });

    console.log('---payload--');
    console.log(payload);
    const {userInfo} = payload ?? {};
    if (!userInfo?.id) {
      throw new BadRequestException('Token data not valid');
    }

    request['userId'] = payload?.userInfo.id;

   
  

    return true;


  }
}