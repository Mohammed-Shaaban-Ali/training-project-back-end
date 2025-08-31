import  {Injectable} from '@nestjs/common';
import {UsersService} from './users.service';
import { User } from './entities/user.entity';
import { PaginatedResult } from 'src/common';
import { CreateUserDto } from './dto/create-user.dto';


@Injectable()
export class UsersInterface {
  
  constructor (private readonly usersService: UsersService) {}


  create (createUserDto: CreateUserDto) {
    try {
    
    return this.usersService.create(createUserDto);

    } catch(error) {
      throw error;
    }
  }

  findAll (query): Promise<PaginatedResult<User>> {
    try {
      return this.usersService.findAll(query);

    } catch(error) {
      throw error;
    }

  }

  findOne (id: number) {
    try {
    
    return this.usersService.findOne(id);

    } catch(error) {
      throw error;
    }
  }

  update(params) {
    try {
      const {id, updateUserDto} = params;

      return this.usersService.update(id, updateUserDto);

    } catch(error) {
      throw error;
    }
  }

  toggleActive (id: number) {
    try {
      return this.usersService.toggleActive(id);

    } catch(error) {
      throw error;
    }
  }

  remove (id: number) {
    try {
      return this.usersService.remove(id);

    } catch(error) {
      throw error;
    }
  }

}