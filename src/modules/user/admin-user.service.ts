import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SearchResult } from 'src/@types/search.type';
import { User } from 'src/entities/user.entity';
import { Hash } from 'src/helpers/hash.helper';
import { S3Service } from 'src/services/aws/s3.service';
import { IsNull, Not, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create.dto';
import { SearchUserDto, SearchUserFilterDto } from './dto/search.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesEnum } from 'src/utils/enums';

@Injectable()
export class AdminUserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly s3Service: S3Service,
  ) {}

  async create(data: CreateUserDto) {
    const email = data.email?.toLowerCase();

    if (email) {
      const emailExists = await this.userRepository.findOne({
        where: {
          email,
          deleted_at: IsNull(),
        },
      });

      if (emailExists) {
        throw new BadRequestException('Este e-mail já está cadastrado.');
      }
    }

    const password = data.password ? Hash.encrypt(data.password) : undefined;

    const user = this.userRepository.create({
      ...data,
      email,
      password,
    });

    return this.withSignedAvatar(await this.userRepository.save(user));
  }

  async search(
    { filter, page = 1, per_page = 10 }: SearchUserDto,
    user?: User,
  ): Promise<SearchResult<User[]>> {
    try {
      const skip = (page - 1) * per_page;

      const where: any = {
        deleted_at: IsNull(),
        role: Not(RolesEnum.SUPER_ADMIN),
        ...this.buildSearchFilter(filter, user),
      };

      const [result, total] = await this.userRepository.findAndCount({
        where,
        skip,
        take: per_page,
        order: {
          created_at: 'DESC',
        },
      });
      const signedResults = await Promise.all(
        result.map((item) => this.withSignedAvatar(item)),
      );

      return {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / per_page),
        items: signedResults,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Oops, ocorreu algum erro ao tentar buscar usuários :(',
        error,
      );
    }
  }

  async findById(id: string) {
    return this.withSignedAvatar(await this.getUserById(id));
  }

  private async getUserById(id: string) {
    const user = await this.userRepository.findOne({
      where: {
        id,
        deleted_at: IsNull(),
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return user;
  }

  async update(id: string, data: UpdateUserDto) {
    const user = await this.getUserById(id);

    const email = data.email?.toLowerCase();

    if (email) {
      const emailExists = await this.userRepository.findOne({
        where: {
          email,
          id: Not(id),
          deleted_at: IsNull(),
        },
      });

      if (emailExists) {
        throw new BadRequestException('Este e-mail já está sendo usado.');
      }
    }

    const password = data.password ? Hash.encrypt(data.password) : undefined;

    const preload = await this.userRepository.preload({
      ...user,
      ...data,
      email,
      password,
    });

    return this.withSignedAvatar(await this.userRepository.save(preload));
  }

  async updatePassword(id: string, data: UpdateUserPasswordDto) {
    const user = await this.getUserById(id);

    const password = Hash.encrypt(data.password);

    const preload = await this.userRepository.preload({
      ...user,
      password,
    });

    return this.withSignedAvatar(await this.userRepository.save(preload));
  }

  async remove(id: string) {
    const user = await this.getUserById(id);

    await this.userRepository.softRemove(user);

    return {
      message: 'Usuário removido com sucesso.',
    };
  }

  async getUsersWithLimits({
    page = 1,
    per_page = 20,
  }: {
    page?: number;
    per_page?: number;
  }) {
    const skip = (page - 1) * per_page;

    const [users, total] = await this.userRepository.findAndCount({
      where: { deleted_at: IsNull() },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      skip,
      take: per_page,
      order: { name: 'ASC' },
    });

    return {
      totalItems: total,
      currentPage: page,
      totalPages: Math.ceil(total / per_page),
      items: users,
    };
  }

  async getUserLimits(id: string) {
    const user = await this.userRepository.findOne({
      where: { id, deleted_at: IsNull() },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  private buildSearchFilter(
    filter?: SearchUserFilterDto,
    user?: User,
  ): Record<string, any> {
    const where: Record<string, any> = {};

    if (filter?.id) where.id = filter.id;
    if (filter?.name) where.name = filter.name;
    if (filter?.email) where.email = filter.email;
    if (filter?.document) where.document = filter.document;
    if (filter?.role) where.role = filter.role;

    return where;
  }

  private async withSignedAvatar(user: User): Promise<User> {
    return {
      ...user,
      avatarUrl: await this.s3Service.getSignedUrlForImage(user.avatarUrl),
    };
  }
}
