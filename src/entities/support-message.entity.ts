import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntityWithUUID, SupportTicket, User } from './index';

@Entity({ name: 'support_messages' })
export class SupportMessage extends BaseEntityWithUUID {
  @Column({
    name: 'ticket_id',
    type: 'uuid',
  })
  ticketId: string;

  @ManyToOne(() => SupportTicket, (ticket) => ticket.messages)
  @JoinColumn({ name: 'ticket_id' })
  ticket: SupportTicket;

  @Column({
    name: 'sender_id',
    type: 'uuid',
  })
  senderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({
    name: 'message',
    type: 'text',
  })
  message: string;

  @Column({
    name: 'attachment_url',
    type: 'text',
    nullable: true,
  })
  attachmentUrl: string | null;

  @Column({
    name: 'attachment_mime_type',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  attachmentMimeType: string | null;

  @Column({
    name: 'attachment_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  attachmentName: string | null;

  @Column({
    name: 'attachment_size',
    type: 'int',
    nullable: true,
  })
  attachmentSize: number | null;
}
