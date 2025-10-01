import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {v4 as uuidV4} from 'uuid';

@Injectable()
export class Utils {

  private readonly logger = new Logger(Utils.name);
  constructor( private readonly jwtService: JwtService) {}

  public async generateAccessToken (params) {
    try {

      const {payload} = params;
      
      // the 'secret' & the 'expiresIn' added globally in the appModule
      const token = await this.jwtService.signAsync(payload);
  
      return token;
  
    } catch(error) {
      // this.logger.error('generateAccessToken::', error.stack || error);
      throw new InternalServerErrorException( 'Error while generate the access token');
    }
  }
  public generateRefreshToken() {

    return uuidV4();
  }
}

