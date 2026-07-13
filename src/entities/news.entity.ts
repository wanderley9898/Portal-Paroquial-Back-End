import 'reflect-metadata';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntityWithUUID, User } from './index';
import { NewsCategoryEnum } from 'src/utils/enums';

@Entity({ name: 'news' })
export class News extends BaseEntityWithUUID {
  @Index()
  @Column({
    type: 'varchar',
    length: 150,
  })
  title: string;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  subtitle?: string;

  @Column({
    type: 'text',
  })
  content: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  coverImage?: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  thumbnail?: string;

  @Column({
    type: 'enum',
    enum: NewsCategoryEnum,
    default: NewsCategoryEnum.NEWS,
  })
  category: NewsCategoryEnum;

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
    type: 'timestamptz',
    nullable: true,
  })
  publishedAt?: Date;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  expiresAt?: Date;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  youtubeUrl?: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  externalUrl?: string;

  @Column({
    type: 'simple-array',
    nullable: true,
  })
  tags?: string[];

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
