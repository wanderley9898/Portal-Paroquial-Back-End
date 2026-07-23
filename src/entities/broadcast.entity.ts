import 'reflect-metadata';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntityWithUUID, User } from './index';
import { BroadcastStatusEnum } from 'src/utils/enums';

@Entity({ name: 'broadcasts' })
export class Broadcast extends BaseEntityWithUUID {
  @Index()
  @Column({
    type: 'varchar',
    length: 150,
  })
  title: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  youtubeUrl: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  thumbnail?: string;

  @Column({
    type: 'enum',
    enum: BroadcastStatusEnum,
    default: BroadcastStatusEnum.UPCOMING,
  })
  status: BroadcastStatusEnum;

  @Column({
    type: 'timestamptz',
  })
  scheduledAt: Date;

  @Column({
    type: 'boolean',
    default: false,
  })
  featured: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  published: boolean;

  @Column({
    type: 'int',
    default: 0,
  })
  views: number;

  @ManyToOne(() => User, {
    nullable: false,
  })
  @JoinColumn({
    name: 'author_id',
  })
  author: User;
}
