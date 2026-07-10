import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import configuration from 'src/config/configuration';
import { User } from 'src/entities';
import { Hash } from 'src/helpers/hash.helper';
import { RolesEnum } from 'src/utils/enums';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async runSeed() {
    console.log('🚀 Iniciando seed...');
    await this.seedSuperAdmin();
    console.log('✅ Seed finalizado com sucesso!');
  }

  /**
   * Cria o usuário Super Admin principal
   */
  private async seedSuperAdmin() {
    const adminConfig = configuration().admin;

    const existingUser = await this.userRepository.findOne({
      where: { email: adminConfig.email },
    });

    if (existingUser) {
      console.log('👑 Super Admin já existe, ignorando criação.');
      return;
    }

    const newSuperAdmin = this.userRepository.create({
      document: adminConfig.document,
      email: adminConfig.email,
      name: adminConfig.name,
      password: Hash.encrypt(adminConfig.password),
      role: RolesEnum.SUPER_ADMIN,
      isVerified: true,
    });

    await this.userRepository.save(newSuperAdmin);

    console.log(`👑 Super Admin criado: ${adminConfig.email}`);
  }
}
