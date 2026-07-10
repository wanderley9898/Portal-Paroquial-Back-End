import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PermissionGroup } from 'src/entities';
import { User as UserEntity } from 'src/entities/user.entity';
import { Hash } from 'src/helpers/hash.helper';
import { formatter } from 'src/utils';
import { mimetypeToExtension } from 'src/utils/mimetype-to-extension.util';
import { saveFile } from 'src/utils/save-file.util';
import { IsNull, Repository } from 'typeorm';
import { UpdateInfoDto } from './dto/update-info.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    @InjectRepository(PermissionGroup)
    private permissionGroupRepository: Repository<PermissionGroup>,
  ) {}

  async create(userData: Partial<UserEntity>): Promise<UserEntity> {
    const permissionGroup = await this.permissionGroupRepository.findOne({
      where: { role: userData.role },
    });

    if (!permissionGroup) {
      throw new BadRequestException(
        `Nenhum grupo de permissão foi encontrado.`,
      );
    }

    const playerCode = await this.generateUniquePlayerCode();

    const user = this.userRepository.create({
      ...userData,
      email: userData.email?.toLowerCase(),
      playerCode,
      permissionGroupId: permissionGroup.id,
    });

    return await this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findOne({
      where: {
        deleted_at: IsNull(),
        email: email.toLowerCase(),
      },
      relations: ['permissionGroup'],
    });

    if (user) {
      await this.ensurePlayerCode(user);
    }

    return user;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    await this.ensurePlayerCode(user);
    return user;
  }

  async updateInfo(data: UpdateInfoDto, user: UserEntity) {
    const entity = await this.userRepository.findOne({
      where: {
        id: user.id,
        deleted_at: IsNull(),
      },
    });

    if (!entity) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const normalizedEmail = data.email?.toLowerCase();
    if (normalizedEmail) {
      const existingUser = await this.userRepository.findOne({
        where: {
          email: normalizedEmail,
          deleted_at: IsNull(),
        },
      });

      if (existingUser && existingUser.id !== entity.id) {
        throw new BadRequestException(
          'E-mail já está em uso por outro usuário.',
        );
      }
    }

    const preload = await this.userRepository.preload(entity);

    const phoneValue = data.phone === '' ? null : data.phone;

    Object.assign(preload, {
      ...(data.document !== undefined ? { document: data.document } : {}),
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
      ...(normalizedEmail !== undefined ? { email: normalizedEmail } : {}),
      ...(data.phone !== undefined ? { phone: phoneValue } : {}),
    });

    return this.userRepository.save(preload);
  }

  async updatePassword(data: UpdatePasswordDto, user: UserEntity) {
    const entity = await this.userRepository.findOne({
      where: {
        id: user.id,
        deleted_at: IsNull(),
      },
    });

    if (!entity) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const isMatch: boolean = Hash.compare(data.oldPassword, entity.password);

    if (!isMatch) {
      throw new BadRequestException('Senha inválida.');
    }

    const hashPassword = Hash.encrypt(data.newPassword);

    const preload = await this.userRepository.preload(entity);
    Object.assign(preload, {
      password: hashPassword,
    });

    return this.userRepository.save(preload);
  }

  async updateProfilePhoto(file: Express.Multer.File, user: UserEntity) {
    const entity = await this.findById(user.id);
    const entityPreload = await this.userRepository.preload(entity);
    const filename = formatter.slug(`${entity.name}-${user.id}`);
    const extension = mimetypeToExtension(file.mimetype);

    const avatarUrl = saveFile(file, `${filename}${extension}`, 'logo');
    Object.assign(entityPreload, {
      avatarUrl,
    });

    await this.userRepository.save(entityPreload);

    return this.findById(user.id);
  }

  private async generateUniquePlayerCode(): Promise<string> {
    for (let i = 0; i < 20; i += 1) {
      const code = `LF${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

      const existing = await this.userRepository.findOne({
        where: {
          playerCode: code,
          deleted_at: IsNull(),
        },
        select: {
          id: true,
        },
      });

      if (!existing) {
        return code;
      }
    }

    throw new BadRequestException(
      'Nao foi possível gerar um código único para o jogador.',
    );
  }

  private async ensurePlayerCode(user: UserEntity): Promise<void> {
    if (user.playerCode) {
      return;
    }

    const playerCode = await this.generateUniquePlayerCode();
    user.playerCode = playerCode;
    await this.userRepository.save(user);
  }
}
