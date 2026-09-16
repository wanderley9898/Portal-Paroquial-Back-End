import 'reflect-metadata';
import { Column, Entity, Index } from 'typeorm';

import { NewsCategoryEnum } from 'src/utils/enums';
import { BaseEntityWithUUID } from './base.entity';

@Entity({ name: 'parish_events' })
export class ParishEvent extends BaseEntityWithUUID {
  @Index()
  @Column({
    type: 'varchar',
    length: 150,
  })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Index()
  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'varchar', length: 5 })
  time: string;

  @Column({ type: 'varchar', length: 5, nullable: true })
  endTime?: string;

  @Column({ type: 'varchar', length: 255 })
  location: string;

  @Column({ type: 'varchar', length: 150 })
  responsible: string;

  @Column({
    type: 'enum',
    enum: NewsCategoryEnum,
    enumName: 'parish_event_category_enum',
  })
  category: NewsCategoryEnum;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image?: string;

  @Column({ type: 'int', default: 0 })
  views: number;
}
