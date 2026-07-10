import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { SearchResult } from 'src/@types';
import { SupportMessage, SupportTicket, User } from 'src/entities';
import { RolesEnum, SupportTicketStatus } from 'src/utils/enums';
import { CreateSupportMessageDto } from './dto/create-support-message.dto';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { SearchSupportTicketDto } from './dto/search-support-ticket.dto';
import { UpdateSupportTicketStatusDto } from './dto/update-support-ticket-status.dto';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(SupportTicket)
    private readonly ticketRepository: Repository<SupportTicket>,
    @InjectRepository(SupportMessage)
    private readonly messageRepository: Repository<SupportMessage>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createTicket(
    data: CreateSupportTicketDto,
    user: User,
    attachment?: {
      url?: string | null;
      name?: string;
      mimeType?: string;
      size?: number;
    },
  ) {
    const ticket = this.ticketRepository.create({
      userId: user.id,
      type: data.type,
      status: SupportTicketStatus.OPEN,
    });

    const savedTicket = await this.ticketRepository.save(ticket);

    await this.createMessage(
      savedTicket.id,
      user.id,
      {
        message: data.message,
      },
      attachment,
    );

    return this.findTicketByIdForUser(savedTicket.id, user);
  }

  async listTicketsForUser(user: User) {
    const tickets = await this.ticketRepository.find({
      where: {
        userId: user.id,
        deleted_at: IsNull(),
      },
      relations: {
        user: true,
        messages: {
          sender: true,
        },
      },
      order: {
        updated_at: 'DESC',
      },
    });

    return tickets.map((ticket) => this.toTicketView(ticket));
  }

  async findTicketByIdForUser(ticketId: string, user: User) {
    const ticket = await this.findTicketOrThrow(ticketId);

    if (ticket.userId !== user.id) {
      throw new UnauthorizedException('Você não pode visualizar este ticket.');
    }

    return this.toTicketView(ticket);
  }

  async addMessageByUser(
    ticketId: string,
    data: CreateSupportMessageDto,
    user: User,
    attachment?: {
      url?: string | null;
      name?: string;
      mimeType?: string;
      size?: number;
    },
  ) {
    const ticket = await this.findTicketOrThrow(ticketId);

    if (ticket.userId !== user.id) {
      throw new UnauthorizedException('Você não pode responder este ticket.');
    }

    const savedMessage = await this.createMessage(
      ticketId,
      user.id,
      data,
      attachment,
    );

    const newStatusUser =
      ticket.status === SupportTicketStatus.CLOSED ||
      ticket.status === SupportTicketStatus.RESOLVED
        ? SupportTicketStatus.OPEN
        : ticket.status;

    await this.ticketRepository.update(ticketId, {
      status: newStatusUser,
      updated_at: new Date(),
    });

    return savedMessage;
  }

  async listTicketsForAdmin(
    query: SearchSupportTicketDto,
  ): Promise<SearchResult<any[]>> {
    const page = query?.page ? Number(query.page) : 1;
    const per_page = query?.per_page ? Number(query.per_page) : 20;
    const skip = Math.max(page - 1, 0) * per_page;

    const qb = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.user', 'user')
      .leftJoinAndSelect('ticket.messages', 'message')
      .leftJoinAndSelect('message.sender', 'sender')
      .where('ticket.deleted_at IS NULL')
      .orderBy('ticket.updated_at', 'DESC')
      .addOrderBy('message.created_at', 'ASC');

    if (query.status) {
      qb.andWhere('ticket.status = :status', {
        status: query.status,
      });
    }

    if (query.type) {
      qb.andWhere('ticket.type = :type', {
        type: query.type,
      });
    }

    if (query.userId) {
      qb.andWhere('ticket.user_id = :userId', {
        userId: query.userId,
      });
    }

    if (query.q) {
      const q = `%${query.q}%`;
      qb.andWhere(
        '(user.name ILIKE :q OR user.email ILIKE :q OR message.message ILIKE :q)',
        { q },
      );
    }

    qb.skip(skip).take(per_page);

    const [items, totalItems] = await qb.getManyAndCount();

    return {
      items: items.map((ticket) => this.toTicketView(ticket)),
      totalItems,
      currentPage: page,
      totalPages: Math.ceil(totalItems / per_page),
    };
  }

  async findTicketByIdForAdmin(ticketId: string) {
    const ticket = await this.findTicketOrThrow(ticketId);
    return this.toTicketView(ticket);
  }

  async addMessageByAdmin(
    ticketId: string,
    data: CreateSupportMessageDto,
    adminUser: User,
    attachment?: {
      url?: string | null;
      name?: string;
      mimeType?: string;
      size?: number;
    },
  ) {
    if (adminUser.role !== RolesEnum.SUPER_ADMIN) {
      throw new ForbiddenException(
        'Apenas administradores podem responder tickets.',
      );
    }

    const ticket = await this.findTicketOrThrow(ticketId);

    const savedMessage = await this.createMessage(
      ticketId,
      adminUser.id,
      data,
      attachment,
    );

    const newStatusAdmin =
      ticket.status === SupportTicketStatus.OPEN
        ? SupportTicketStatus.IN_PROGRESS
        : ticket.status;

    await this.ticketRepository.update(ticketId, {
      status: newStatusAdmin,
      updated_at: new Date(),
    });

    return savedMessage;
  }

  async updateTicketStatusByAdmin(
    ticketId: string,
    data: UpdateSupportTicketStatusDto,
    adminUser: User,
  ) {
    if (adminUser.role !== RolesEnum.SUPER_ADMIN) {
      throw new ForbiddenException(
        'Apenas administradores podem atualizar o status.',
      );
    }

    const ticket = await this.findTicketOrThrow(ticketId);

    ticket.status = data.status;
    ticket.updated_at = new Date();

    return this.ticketRepository.save(ticket);
  }

  async assertCanAccessTicketRealtime(
    ticketId: string,
    userId: string,
    role?: string,
  ) {
    const ticket = await this.ticketRepository.findOne({
      where: {
        id: ticketId,
        deleted_at: IsNull(),
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket não encontrado.');
    }

    if (role === RolesEnum.SUPER_ADMIN) {
      return true;
    }

    if (ticket.userId !== userId) {
      throw new UnauthorizedException('Você não pode acessar este ticket.');
    }

    return true;
  }

  private async createMessage(
    ticketId: string,
    senderId: string,
    data: CreateSupportMessageDto,
    attachment?: {
      url?: string | null;
      name?: string;
      mimeType?: string;
      size?: number;
    },
  ) {
    const sender = await this.userRepository.findOne({
      where: {
        id: senderId,
        deleted_at: IsNull(),
      },
    });

    if (!sender) {
      throw new NotFoundException('Usuário remetente não encontrado.');
    }

    const normalizedMessage = (data.message ?? '').trim();
    const attachmentUrl = attachment?.url?.trim() || null;

    if (!normalizedMessage && !attachmentUrl) {
      throw new BadRequestException(
        'Envie um texto ou um arquivo no atendimento.',
      );
    }

    const message = this.messageRepository.create({
      ticketId,
      senderId,
      message: normalizedMessage,
      attachmentUrl,
      attachmentMimeType: attachment?.mimeType?.trim() || null,
      attachmentName: attachment?.name?.trim() || null,
      attachmentSize: attachment?.size ?? null,
    });

    const savedMessage = await this.messageRepository.save(message);

    return this.messageRepository.findOneOrFail({
      where: {
        id: savedMessage.id,
      },
      relations: {
        sender: true,
      },
    });
  }

  private async findTicketOrThrow(ticketId: string) {
    const ticket = await this.ticketRepository.findOne({
      where: {
        id: ticketId,
        deleted_at: IsNull(),
      },
      relations: {
        user: true,
        messages: {
          sender: true,
        },
      },
      order: {
        messages: {
          created_at: 'ASC',
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket de suporte não encontrado.');
    }

    return ticket;
  }

  private toTicketView(ticket: SupportTicket) {
    const orderedMessages = [...(ticket.messages ?? [])].sort(
      (a, b) =>
        new Date(a.created_at || 0).getTime() -
        new Date(b.created_at || 0).getTime(),
    );

    const lastMessage =
      orderedMessages.length > 0
        ? orderedMessages[orderedMessages.length - 1]
        : null;

    return {
      ...ticket,
      messages: orderedMessages,
      lastMessage,
    };
  }
}
