import { BadRequestException, HttpException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateUserDto, UsersService } from '../users';
import { UserHelper } from 'src/common/helpers/user.helper';
import { Utils } from 'src/modules/global-utilities/utils';
import {ConfigService} from '@nestjs/config';
import { UserKeys } from '../users/types';
import { MoreThanOrEqual } from 'typeorm';

@Injectable()
export class AuthService {

  // private readonly logger = new Logger(AuthService.name, {timestamp: true});

  constructor(
    private readonly userService: UsersService,
    private readonly utils: Utils,
    private readonly configs: ConfigService,
  ) {}



  public async signUp (newUser: CreateUserDto) {

    // // hash password
    const hashedPassword = await UserHelper.hashPassword(newUser.password);
    // const user = this.userRepository.create({
    //   ...createUserDto,
    //   password: hashedPassword,
    //   });
    newUser.password = hashedPassword;

    const user = await this.userService.create(newUser).catch(error => {
      if (error instanceof HttpException) throw error 
      else throw new InternalServerErrorException('Something went wrong while creating new user');
    });

    const payload = {id: user.id};

    const accessToken = await this.utils.generateAccessToken({payload}).catch(error => {
      if (error instanceof HttpException) throw error;
      else throw new InternalServerErrorException('Error while generate the access token');

    });

    const {refreshToken} = await this.handlerRefreshToken({userId: user.id});

   return { accessToken , refreshToken};

  }

  public async login (params) {

    const { email, password} = params;

    const user = await this.userService.findByEmail(email);
    
    if (!user) throw new BadRequestException('User not found');
    

    const isMatching = await UserHelper.comparePassword(password, user.password);

    if (!isMatching) throw new BadRequestException('Wrong password');
    
    
    const result = await this.generateAccessRefreshTokens({userId: user.id});

    return result;

  }


  private async handlerRefreshToken (params: {userId: number}) {
    try {
      const {userId} = params;

      const expiredDates = +(this.configs.get<string>('REFRESH_TOKEN_EXPIRY_IN') || '7');
      const refreshTokenExpiryDate = new Date();
      refreshTokenExpiryDate.setDate(refreshTokenExpiryDate.getDate() + expiredDates);
  
      
      const refreshToken = this.utils.generateRefreshToken();
      
      const query = { id: userId};
      const updatedFields = {refreshTokenExpiryDate, refreshToken};
      await this.userService.updateV2({query, updatedFields}).catch(error => {
        Logger.error('Login:: ', error.trace);
      })

      return {refreshToken};

    } catch(error) {
      Logger.error('handlerRefreshToken::', error.trace);
      throw error;
    }
  }

  private async generateAccessRefreshTokens(params: {userId: number}) {

    const payload = {
      userInfo: {
        id: params.userId,
      }
    };
    console.log('--payload:', payload);

    const accessToken = await this.utils.generateAccessToken({payload}).catch(error => {
      if (error instanceof HttpException) throw error;
      else throw new InternalServerErrorException('Error while generate the access token');

    });

    const {refreshToken} = await this.handlerRefreshToken({userId: params.userId});


    return { accessToken, refreshToken };
  }



  public async refreshAccessToken(params: {refreshToken: string}): Promise<{accessToken: string; refreshToken: string}> {

    const {refreshToken} = params;

    const where = {
      refreshToken,
      refreshTokenExpiryDate: MoreThanOrEqual(new Date()),
    };

    const select: UserKeys[] = ['refreshToken', 'id'];

    const user = await this.userService.findOne(where, select);


    if (!user?.refreshToken) {
      throw new BadRequestException('Use Manual login'); // let the user login by his creds 
    }


    const result = await this.generateAccessRefreshTokens({userId: user.id});

    return result;

  }
  
}
