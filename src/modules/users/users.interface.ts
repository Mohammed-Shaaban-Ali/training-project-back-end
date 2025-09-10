import  {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {UsersService} from './users.service';
import { User } from './entities/user.entity';
import { PaginatedResult } from 'src/common';
import { CreateUserDto } from './dto/create-user.dto';


@Injectable()
export class UsersInterface {
  
  constructor (private readonly usersService: UsersService) {}


  public create (createUserDto: CreateUserDto) {
    
    return this.usersService.create(createUserDto);

  }

  public findAll (query): Promise<PaginatedResult<User>> {
    return this.usersService.findAll(query);

  }

  public findOne (id: number) {    
    return this.usersService.findOne(id);

  }

  public update(params) {
    const {id, updateUserDto} = params;

    return this.usersService.update(id, updateUserDto);
    
  }

  public toggleActive (id: number) {
   
    return this.usersService.toggleActive(id);
  }

  remove (id: number) {

    return this.usersService.remove(id);
  }

  public changePassword(params) {
    
    const {body, id} = params;

    if (!body.oldPassword) throw new BadRequestException('Old Password is required');
    
    if (!body.newPassword) throw new BadRequestException('The new password is missed');
    
    if (!id) throw new BadRequestException('User id is missing');

    // if (!hostname) throw new BadRequestException('Request hostname is missing');


    return this.usersService.changePassword(params);
  }

  public forgetPassword(params: {currentUser: User, hostname: string}) {
    const {currentUser, hostname} = params;

    if (!currentUser) throw new NotFoundException('User not found');

    if (!currentUser?.id) throw new NotFoundException('User Id not found');
    
    if (!currentUser?.email) throw new NotFoundException('Email not found');


    if (!hostname) throw new NotFoundException('request hostname not found');


    return this.usersService.forgetPassword(params);

  }

}