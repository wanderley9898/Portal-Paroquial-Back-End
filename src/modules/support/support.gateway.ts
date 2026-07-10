import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import configuration from 'src/config/configuration';
import { SupportTicket } from 'src/entities';
import { UserService } from 'src/modules/user/user.service';
import { SupportService } from './support.service';
import { RolesEnum } from 'src/utils/enums';

type JoinTicketPayload = {
  ticketId?: string;
};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SupportGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly supportService: SupportService,
  ) {}

  async handleConnection(client: Socket) {
    const token = this.extractToken(client);

    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      const decoded = this.jwtService.verify(token, {
        secret: configuration().jwt.secret,
      }) as { email?: string };

      if (!decoded.email) {
        client.disconnect(true);
        return;
      }

      const user = await this.userService.findByEmail(decoded.email);
      if (!user) {
        client.disconnect(true);
        return;
      }

      client.data.userId = user.id;
      client.data.role = user.role;
      client.join(this.getUserRoom(user.id));

      if (user.role === RolesEnum.SUPER_ADMIN) {
        client.join(this.getAdminRoom());
      }
    } catch {
      client.disconnect(true);
    }
  }

  @SubscribeMessage('support:join-ticket')
  async handleJoinTicket(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinTicketPayload,
  ) {
    const ticketId = String(payload?.ticketId || '').trim();

    if (!ticketId) {
      throw new WsException('ticketId é obrigatório.');
    }

    const userId = String(client.data.userId || '').trim();
    const role = String(client.data.role || '').trim();

    if (!userId) {
      throw new WsException('Usuário não autenticado.');
    }

    await this.supportService.assertCanAccessTicketRealtime(
      ticketId,
      userId,
      role,
    );

    client.join(this.getTicketRoom(ticketId));

    return {
      ok: true,
      ticketId,
    };
  }

  notifyTicketCreated(ticket: SupportTicket) {
    const payload = {
      version: 1,
      event: 'ticket.created',
      ticketId: ticket.id,
      userId: ticket.userId,
      type: ticket.type,
      status: ticket.status,
      createdAt: ticket.created_at,
    };

    this.server.to(this.getAdminRoom()).emit('ticket.created', payload);
    this.server
      .to(this.getUserRoom(ticket.userId))
      .emit('ticket.created', payload);
    this.server
      .to(this.getTicketRoom(ticket.id))
      .emit('ticket.created', payload);
  }

  notifyMessageCreated(params: {
    ticketId: string;
    messageId: string;
    senderId: string;
    userId: string;
    createdAt: Date;
  }) {
    const payload = {
      version: 1,
      event: 'message.created',
      ticketId: params.ticketId,
      messageId: params.messageId,
      senderId: params.senderId,
      userId: params.userId,
      createdAt: params.createdAt,
    };

    this.server
      .to(this.getTicketRoom(params.ticketId))
      .emit('message.created', payload);
    this.server.to(this.getAdminRoom()).emit('message.created', payload);
    this.server
      .to(this.getUserRoom(params.userId))
      .emit('message.created', payload);
  }

  notifyTicketStatusChanged(ticket: SupportTicket) {
    const payload = {
      version: 1,
      event: 'ticket.status.changed',
      ticketId: ticket.id,
      userId: ticket.userId,
      status: ticket.status,
      updatedAt: ticket.updated_at,
    };

    this.server
      .to(this.getTicketRoom(ticket.id))
      .emit('ticket.status.changed', payload);
    this.server.to(this.getAdminRoom()).emit('ticket.status.changed', payload);
    this.server
      .to(this.getUserRoom(ticket.userId))
      .emit('ticket.status.changed', payload);
  }

  private getAdminRoom() {
    return 'support:admins';
  }

  private getUserRoom(userId: string) {
    return `support:user:${userId}`;
  }

  private getTicketRoom(ticketId: string) {
    return `support:ticket:${ticketId}`;
  }

  private extractToken(client: Socket) {
    const authToken =
      typeof client.handshake.auth?.token === 'string'
        ? client.handshake.auth.token
        : '';

    if (authToken) {
      return authToken.startsWith('Bearer ')
        ? authToken.slice('Bearer '.length)
        : authToken;
    }

    const authorizationHeader = client.handshake.headers.authorization;

    if (typeof authorizationHeader === 'string' && authorizationHeader) {
      const [, token] = authorizationHeader.split(' ');
      return token || '';
    }

    return '';
  }
}
