import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUsersDto } from './dto/filter-users.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { PaginationHelper } from '../../common/helpers/pagination.helper';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Check if user with same email and teacher_id already exists
      const existingUser = await this.userRepository.findOne({
        where: {
          email: createUserDto.email,
          teacher_id: createUserDto.teacher_id || null,
        },
      });

      if (existingUser) {
        throw new ConflictException(
          'User with this email and teacher_id already exists',
        );
      }

      const user = this.userRepository.create(createUserDto);
      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create user');
    }
  }

  async findAll(
    filters?: FilterUsersDto,
    pagination?: PaginationDto,
  ): Promise<PaginatedResult<User>> {
    const queryBuilder = this.createFilteredQuery(filters);

    const total = await queryBuilder.getCount();

    if (pagination) {
      queryBuilder.skip(pagination.skip).take(pagination.limit);
    }

    const users = await queryBuilder.getMany();

    const page = pagination?.page || 1;
    const limit = pagination?.limit || total || 10;

    return PaginationHelper.paginate(users, total, page, limit);
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string, teacherId?: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: {
        email,
        teacher_id: teacherId || null,
      },
    });
  }

  async findByRole(role: string): Promise<User[]> {
    return await this.userRepository.find({
      where: { role: role as any },
      order: {
        created_at: 'DESC',
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check for unique constraint if email or teacher_id is being updated
    if (updateUserDto.email || updateUserDto.teacher_id !== undefined) {
      const existingUser = await this.userRepository.findOne({
        where: {
          email: updateUserDto.email || user.email,
          teacher_id: updateUserDto.teacher_id ?? user.teacher_id,
        },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException(
          'User with this email and teacher_id already exists',
        );
      }
    }

    try {
      Object.assign(user, updateUserDto);
      return await this.userRepository.save(user);
    } catch (error) {
      throw new BadRequestException('Failed to update user');
    }
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async toggleActive(id: number): Promise<User> {
    const user = await this.findOne(id);
    user.active = !user.active;
    return await this.userRepository.save(user);
  }

  async getActiveUsers(): Promise<User[]> {
    return await this.userRepository.find({
      where: { active: true },
      order: {
        created_at: 'DESC',
      },
    });
  }

  async getUsersByTeacher(teacherId: number): Promise<User[]> {
    return await this.userRepository.find({
      where: { teacher_id: teacherId },
      order: {
        created_at: 'DESC',
      },
    });
  }

  private createFilteredQuery(
    filters?: FilterUsersDto,
  ): SelectQueryBuilder<User> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .orderBy('user.created_at', 'DESC');

    if (!filters) {
      return queryBuilder;
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(user.name ILIKE :search OR user.email ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters.role) {
      queryBuilder.andWhere('user.role = :role', { role: filters.role });
    }

    if (filters.active !== undefined) {
      queryBuilder.andWhere('user.active = :active', {
        active: filters.active,
      });
    }

    if (filters.teacher_id) {
      queryBuilder.andWhere('user.teacher_id = :teacherId', {
        teacherId: filters.teacher_id,
      });
    }

    if (filters.email) {
      queryBuilder.andWhere('user.email = :email', { email: filters.email });
    }

    if (filters.phone) {
      queryBuilder.andWhere('user.phone ILIKE :phone', {
        phone: `%${filters.phone}%`,
      });
    }

    return queryBuilder;
  }
}
