import { InternalServerErrorException,Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

export class UserHelper {
  private static readonly logger = new Logger(UserHelper.name);

  static  async hashPassword(password: string): Promise<string> {
    try {

      const result = await bcrypt.hash(password, 10);

      return result;
      
    } catch(error) {
      this.logger.error('hashPassword::', error.message);

      throw new InternalServerErrorException('Something went wrong while hashing the user password');

    }
  
  }

  static comparePassword(password, hashPassword) {
    return bcrypt.compare(password, hashPassword);
  }
}
