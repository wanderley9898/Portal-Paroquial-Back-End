import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { BaseEntityWithUUID, SupportMessage, User } from './index';
import { SupportTicketType, SupportTicketStatus } from 'src/utils/enums';

@Entity({ name: 'support_tickets' })
export class SupportTicket extends BaseEntityWithUUID {
  @Column({
    name: 'user_id',
    type: 'uuid',
  })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'type',
    type: 'enum',
    enum: SupportTicketType,
  })
  type: SupportTicketType;

  @Column({
    name: 'status',
    type: 'enum',
    enum: SupportTicketStatus,
    default: SupportTicketStatus.OPEN,
  })
  status: SupportTicketStatus;

  @OneToMany(() => SupportMessage, (message) => message.ticket)
  messages: SupportMessage[];
}
