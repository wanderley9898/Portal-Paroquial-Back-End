import 'reflect-metadata';
import { Column, Entity, Index } from 'typeorm';

import { RolesEnum } from 'src/utils/enums';
import { BaseEntityWithUUID } from './index';

@Entity({ name: 'users' })
export class User extends BaseEntityWithUUID {
  @Column({
    default: true,
    nullable: true,
    name: 'verified',
    type: 'boolean',
  })
  isVerified: boolean;

  @Column({
    name: 'avatarUrl',
    nullable: true,
    type: 'varchar',
  })
  avatarUrl: string;

  @Column({
    length: 255,
    nullable: false,
    name: 'name',
    type: 'varchar',
  })
  name: string;

  @Index()
  @Column({
    length: 18,
    name: 'document',
    nullable: true,
    type: 'varchar',
  })
  document: string; // Cpf ou Cnpj.

  @Index()
  @Column({
    length: 100,
    nullable: true,
    name: 'email',
    type: 'varchar',
  })
  email: string;

  @Column({
    enum: RolesEnum,
    nullable: false,
    name: 'role',
    type: 'enum',
  })
  role: RolesEnum;

  @Column({
    name: 'isActive',
    type: 'boolean',
    nullable: false,
    default: true,
  })
  isActive: boolean;

  @Column({
    length: 20,
    nullable: true,
    name: 'phone',
    type: 'varchar',
  })
  phone: string;

  @Column({
    length: 100,
    nullable: true,
    name: 'password',
    type: 'varchar',
  })
  password: string;

  @Column({
    name: 'isSocialLogin',
    type: 'boolean',
    nullable: true,
    default: false,
  })
  isSocialLogin: boolean;

  @Column({
    name: 'terms_accepted_at',
    type: 'timestamptz',
    nullable: true,
  })
  termsAcceptedAt?: Date | null;

  @Column({
    name: 'privacy_accepted_at',
    type: 'timestamptz',
    nullable: true,
  })
  privacyAcceptedAt?: Date | null;

  @Column({
    name: 'cookies_accepted_at',
    type: 'timestamptz',
    nullable: true,
  })
  cookiesAcceptedAt?: Date | null;

  @Column({
    name: 'terms_accepted_version',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  termsAcceptedVersion?: string | null;

  @Column({
    name: 'privacy_accepted_version',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  privacyAcceptedVersion?: string | null;

  @Column({
    name: 'cookies_accepted_version',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  cookiesAcceptedVersion?: string | null;
}
