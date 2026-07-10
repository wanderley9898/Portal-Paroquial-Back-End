import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SearchResult } from 'src/@types/search.type';
import { Campaign } from 'src/entities/campaign.entity';
import { Character } from 'src/entities/character.entity';
import { PermissionGroup } from 'src/entities/permission-group.entity';
import { User } from 'src/entities/user.entity';
import { World } from 'src/entities/world.entity';
import { Hash } from 'src/helpers/hash.helper';
import { IsNull, Not, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create.dto';
import { SearchUserDto, SearchUserFilterDto } from './dto/search.dto';
import { UpdateUserLimitsDto } from './dto/update-user-limits.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AdminUserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(PermissionGroup)
    private readonly permissionGroupRepository: Repository<PermissionGroup>,

    @InjectRepository(World)
    private readonly worldRepository: Repository<World>,

    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,

    @InjectRepository(Character)
    private readonly characterRepository: Repository<Character>,
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

    const permissionGroup = await this.permissionGroupRepository.findOne({
      where: { role: data.role },
    });

    if (!permissionGroup) {
      throw new BadRequestException(
        'Grupo de permissão não encontrado para essa role.',
      );
    }

    const password = data.password ? Hash.encrypt(data.password) : undefined;

    const user = this.userRepository.create({
      ...data,
      email,
      password,
      permissionGroupId: permissionGroup.id,
    });

    return this.userRepository.save(user);
  }

  async search(
    { filter, page = 1, per_page = 10 }: SearchUserDto,
    user?: User,
  ): Promise<SearchResult<User[]>> {
    try {
      const skip = (page - 1) * per_page;

      const where: any = {
        deleted_at: IsNull(),
        ...this.buildSearchFilter(filter, user),
      };

      const [result, total] = await this.userRepository.findAndCount({
        where,
        relations: ['permissionGroup'],
        skip,
        take: per_page,
        order: { created_at: 'DESC' },
      });

      return {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / per_page),
        items: result,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Oops, ocorreu algum erro ao tentar buscar usuários :(',
        error,
      );
    }
  }

  async findById(id: string) {
    const user = await this.userRepository.findOne({
      where: {
        id,
        deleted_at: IsNull(),
      },
      relations: ['permissionGroup'],
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return user;
  }

  async update(id: string, data: UpdateUserDto) {
    const user = await this.findById(id);

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

    delete data.password;

    const preload = await this.userRepository.preload({
      ...user,
      ...data,
      email,
    });

    return this.userRepository.save(preload);
  }

  async updatePassword(id: string, data: UpdateUserPasswordDto) {
    const user = await this.findById(id);

    const password = Hash.encrypt(data.password);

    const preload = await this.userRepository.preload({
      ...user,
      password,
    });

    return this.userRepository.save(preload);
  }

  async remove(id: string) {
    const user = await this.findById(id);

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
        maxSystems: true,
        maxCampaigns: true,
        maxCharacters: true,
      },
      skip,
      take: per_page,
      order: { name: 'ASC' },
    });

    const items = await Promise.all(
      users.map(async (user) => {
        const [systemsCount, campaignsCount, charactersCount] =
          await Promise.all([
            this.worldRepository.count({
              where: { userId: user.id, deleted_at: IsNull() },
            }),
            this.campaignRepository.count({
              where: { ownerId: user.id, deleted_at: IsNull() },
            }),
            this.characterRepository.count({
              where: { userId: user.id, deleted_at: IsNull() },
            }),
          ]);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          maxSystems: user.maxSystems,
          maxCampaigns: user.maxCampaigns,
          maxCharacters: user.maxCharacters,
          systemsCount,
          campaignsCount,
          charactersCount,
        };
      }),
    );

    return {
      totalItems: total,
      currentPage: page,
      totalPages: Math.ceil(total / per_page),
      items,
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
        maxSystems: true,
        maxCampaigns: true,
        maxCharacters: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const [systemsCount, campaignsCount, charactersCount] = await Promise.all([
      this.worldRepository.count({
        where: { userId: id, deleted_at: IsNull() },
      }),
      this.campaignRepository.count({
        where: { ownerId: id, deleted_at: IsNull() },
      }),
      this.characterRepository.count({
        where: { userId: id, deleted_at: IsNull() },
      }),
    ]);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      maxSystems: user.maxSystems,
      maxCampaigns: user.maxCampaigns,
      maxCharacters: user.maxCharacters,
      systemsCount,
      campaignsCount,
      charactersCount,
    };
  }

  async updateUserLimits(id: string, dto: UpdateUserLimitsDto) {
    const user = await this.findById(id);

    const preload = await this.userRepository.preload({
      ...user,
      ...(dto.maxSystems !== undefined && { maxSystems: dto.maxSystems }),
      ...(dto.maxCampaigns !== undefined && { maxCampaigns: dto.maxCampaigns }),
      ...(dto.maxCharacters !== undefined && {
        maxCharacters: dto.maxCharacters,
      }),
    });

    const saved = await this.userRepository.save(preload);

    return {
      id: saved.id,
      maxSystems: saved.maxSystems,
      maxCampaigns: saved.maxCampaigns,
      maxCharacters: saved.maxCharacters,
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
    if (filter?.schoolId) where.schoolId = filter.schoolId;
    if (filter?.enterpriseId) where.enterpriseId = filter.enterpriseId;

    return where;
  }
}
