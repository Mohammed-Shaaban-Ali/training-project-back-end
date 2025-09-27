import { BadRequestException, HttpException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateUserDto, UsersService } from '../users';
import { UserHelper } from 'src/common/helpers/user.helper';
import { Utils } from 'src/modules/global-utilities/utils';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class AuthService {

  // private readonly logger = new Logger(AuthService.name, {timestamp: true});

  constructor(
    private readonly userService: UsersService,
    private readonly utils: Utils,
    private readonly configs: ConfigService,
  ) {}



  async signUp (newUser: CreateUserDto) {

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

    const {refreshToken} = await this.handlerRefreshToken({user});

   return { accessToken , refreshToken};

  }

  async login (params) {

    const { email, password} = params;

    const user = await this.userService.findByEmail(email);
    
    if (!user) throw new BadRequestException('User not found');
    

    const isMatching = await UserHelper.comparePassword(password, user.password);

    if (!isMatching) throw new BadRequestException('Wrong password');
    
    
    const payload = {
      userInfo: {
        id: user.id,
      }
    };
    console.log('--payload:', payload);

    const accessToken = await this.utils.generateAccessToken({payload}).catch(error => {
      if (error instanceof HttpException) throw error;
      else throw new InternalServerErrorException('Error while generate the access token');

    });

    const {refreshToken} = await this.handlerRefreshToken({user});


    return { accessToken, refreshToken };

  }


  async handlerRefreshToken (params) {
    try {
      const {user} = params;

      const expiredDates = +(this.configs.get<string>('REFRESH_TOKEN_EXPIRY_IN') || '7');
      const refreshTokenExpiryDate = new Date();
      refreshTokenExpiryDate.setDate(refreshTokenExpiryDate.getDate() + expiredDates);
  
      
      const refreshToken = this.utils.generateRefreshToken();
      
      const query = { id: user.id};
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

  
 
  
}
