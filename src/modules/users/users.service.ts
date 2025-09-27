import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
  Global,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterAndPaginationDto } from './dto/filter-and-pagination.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { PaginationHelper } from '../../common/helpers/pagination.helper';
import { UserHelper } from 'src/common/helpers/user.helper';
import { MailService } from 'src/utilities/mailer-service';
import {v4 as uuidV4} from 'uuid';
import { ConfigService } from '@nestjs/config';
import { UserKeys, WhereUser } from './types';


@Global()
@Injectable()
export class UsersService {

  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
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

      const user = this.userRepository.create({...createUserDto});

      return await this.userRepository.save(user);

    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create user');
    }
  }

  async findAll(query: FilterAndPaginationDto): Promise<PaginatedResult<User>> {
    const queryBuilder = this.createFilteredQuery(query);

    const total = await queryBuilder.getCount();

    
    if (query.page && query.limit) {
      const skip = (query.page - 1) * query.limit;
      queryBuilder.skip(skip).take(query.limit);
    }

    const users = await queryBuilder.getMany();

    const page = query.page || 1;
    const limit = query.limit || total || 10;


    return PaginationHelper.paginate({users, total, page, limit});

  }

  async findOne(whereInput: WhereUser, select?:  readonly UserKeys[]): Promise<User> {


    const where = this.validateWhereUserClause(whereInput);

    if (!Object.keys(where).length) {
      throw new BadRequestException('findOneV2:: Invalid where user elements');
    }

    const query = {where};

    if(select && select.length) {
      query['select'] = select;
    }

    const user = await this.userRepository.findOne(query);


    if (!user) {
      if (Object.keys(where).includes('resetToken')) {
        throw new NotFoundException(`You need to send a new reset email to proceed`);

      } else {
        throw new NotFoundException(`User not found in DB`);
      }
    }

    return user;
  }

  private validateWhereUserClause(whereInput: WhereUser) {

    const userColumns: string[] = this.getValidUserKeys();

    const output: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(whereInput ?? {}) ) {
      if (value && userColumns.includes(key)) {
        output[key] = value;
      }
    }

    return output;

  }


  // we need to get the User table fields dynamically to get the up to date fields all the time
  private getValidUserKeys(): string [] {
    return this.userRepository.metadata.columns.map(col => col.propertyName) ;
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
    const user = await this.findOne({id});

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
      // If password is being updated, hash the new password
      if (updateUserDto.password) {
        updateUserDto.password = await UserHelper.hashPassword(
          updateUserDto.password,
        );
      }
      Object.assign(user, updateUserDto);
      return await this.userRepository.save(user);
    } catch (error) {
      throw new BadRequestException('Failed to update user');
    }
  }

  async updateV2(params: {query: {}, updatedFields: {}}) {

    const {query, updatedFields} = params;

    return await this.userRepository.update(query, updatedFields);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne({id});
    await this.userRepository.remove(user);
  }

  async toggleActive(id: number): Promise<User> {
    const user = await this.findOne({id});
    user.active = !user.active;
    return await this.userRepository.save(user);
  }

  private createFilteredQuery(
    query: FilterAndPaginationDto,
  ): SelectQueryBuilder<User> {
    const { page, limit, ...filters } = query;
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
      const activeValue =
        typeof filters.active === 'string'
          ? filters.active === 'true'
          : !!filters.active;
      queryBuilder.andWhere('user.active = :active', {
        active: activeValue,
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

  public async changePassword(params) {

    const {id, body} = params;
    const {newPassword, oldPassword} = body

    const select: UserKeys[] = ['id','password'];
    const user = await this.findOne({id}, select);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatching = await UserHelper.comparePassword(oldPassword, user.password);

    if(!isMatching) {
      throw new BadRequestException('The Old Password is not correct');
    }



    const hashedPassword = await UserHelper.hashPassword(newPassword);


    const query = {id};
    const updatedFields = {password:hashedPassword};

    await this.updateV2({query, updatedFields});

    
    
    return ;
  }

 

  public async forgetPassword (params: {email: string, hostname: string}): Promise<void> {

    const {email, hostname} = params;
    // generate the reset password token
    const resetToken = uuidV4();


    const user = await this.findOne({email}, ['id', 'email', 'name']);

    if (!user) {
      throw new NotFoundException('User not exist');
    }
    //generate the reset password expiry date
    const validTimeBeforeExpiration =  15 // in minutes

    const expiresIn =  new Date();
    expiresIn.setMinutes(expiresIn.getMinutes() + validTimeBeforeExpiration );
    expiresIn.toISOString();
    // persist the resetToken and expiry date in the db
    const query = {email: email};
    const updatedFields = {resetToken, resetTokenExpiryDate: expiresIn};
  

    await this.updateV2({query, updatedFields});

    // Sending the reset password email.
    const host = this.getHost(hostname);
    const url = `${host}/api/users/resetPassword?token=${encodeURIComponent(resetToken)}`; 

    console.log('--url:', url);
    const subject = 'Forget Password';
    const text = this.getText({url, user, expiresInMinutes: 15});
    const html = this.getHtml({subject, name: user?.name, url, expiresInMinutes: 15});
    // const text = this.getText({expiresIn, user: currentUser, resetToken}); 

    await this.mailService.sendMail(user.email, subject, text, html).catch(error => {
      this.logger.error('changePassword::', error.trace);
      throw new InternalServerErrorException('Error while sending password change email');
    });

    

    return;
  }

  private getText(params: {user: User, expiresInMinutes: number, url: string}) {

    const {user, expiresInMinutes, url} = params;


    const text =[
      `Hi ${user?.name || 'there'},`,
      '',
      `We received a request to reset your password.`,
      `Use the link below to set a new one (expires in ${expiresInMinutes} minutes):`,
      url,
      '',
      `If you didn’t request this, you can safely ignore this email.`,
      '',
      `Thanks,`,
      `The Team`,
    ].join('\n');

    return text;
  }

  private getHost(hostname: string): string {

    const env = this.config.getOrThrow<string>('app.nodeEnv', 'development');
    const appPort = this.config.getOrThrow<string>('app.port', '3333');

    let host: string = `http://${hostname}:${appPort}`; 

    if (hostname !== 'localhost' && env === 'production') {
      host = `https://'${hostname}`;
    }
    
    return host;
  }

  private getHtml(params: {subject: string, name: string, url: string, expiresInMinutes: 15}) {

    const {subject, name, url, expiresInMinutes} = params;
    

    return `<!doctype html>
            <html lang="en">
            <head>
              <meta charset="utf-8">
              <title>${subject ?? 'There'}</title>
              <meta name="viewport" content="width=device-width, initial-scale=1" />
            </head>
            <body style="margin:0;background:#f6f7fb;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7fb;padding:32px 0;">
                <tr>
                  <td align="center">
                    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,.06);overflow:hidden;">
                      <tr>
                        <td style="background:#1f53ff;height:6px;"></td>
                      </tr>
                      <tr>
                        <td style="padding:28px;">
                          <h1 style="margin:0 0 12px;font-size:20px;line-height:1.4;color:#111;">Reset your password</h1>
                          <p style="margin:0 0 16px;font-size:15px;color:#333;">
                            Hi ${this.escapeHtml(name)}, we received a request to reset your password.
                          </p>
                          <p style="margin:0 0 20px;font-size:15px;color:#333;">
                            Click the button below to choose a new password. This link expires in <strong>${expiresInMinutes ?? 15} minutes</strong>.
                          </p>
                          <p style="margin:0 0 28px;">
                            <a href="${url}" style="display:inline-block;background:#1f53ff;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:600;">
                              Reset Password
                            </a>
                          </p>
                          <p style="margin:0 0 10px;font-size:13px;color:#666;">
                            If the button doesn’t work, copy and paste this URL into your browser:
                          </p>
                          <p style="word-break:break-all;margin:0 0 24px;font-size:12px;color:#666;">
                            <a href="${url}" style="color:#1f53ff;text-decoration:underline;">${url}</a>
                          </p>
                          <p style="margin:0;font-size:13px;color:#666;">If you didn’t request this, you can safely ignore this email.</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="background:#f0f2f7;padding:14px 28px;font-size:12px;color:#65708b;">
                          © ${new Date().getFullYear()} Your Company
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>`

  }

  // Minimal HTML escaping helper for the template:
  private escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
  }


  public async resetPassword(params:{resetToken: string , newPassword: string}) {

    const  {resetToken, newPassword} = params;


    const where = {resetToken};
    const select: UserKeys [] = ['id','resetToken', 'resetTokenExpiryDate'];
    const user = await this.findOne(where, select);

    if(!user) {
      throw new NotFoundException('User not exist at all');
    }



    if (!user.resetToken || !user.resetTokenExpiryDate) {
      throw new BadRequestException('You need to re-send the reset email to be able to proceed');

    }

    const now = new Date();
    if (user.resetTokenExpiryDate && user.resetTokenExpiryDate <  now) {
      throw new BadRequestException('Reset link is expired');
    }

    
    const hashPassword = await UserHelper.hashPassword(newPassword);

    const query = {id: user.id};
    const updatedFields = {password: hashPassword, resetTokenExpiryDate: null, resetToken:null};

    await this.updateV2({query, updatedFields});

    
    return;
  }

}
