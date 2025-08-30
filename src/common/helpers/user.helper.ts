import * as bcrypt from 'bcrypt';

export class UserHelper {
  static hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
