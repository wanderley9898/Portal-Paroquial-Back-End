import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { getMulterConfig } from 'src/config/multer-config';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from 'src/entities';
import { AuthGuard } from 'src/guards/auth.guard';
import { CreateSupportMessageDto } from './dto/create-support-message.dto';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { SupportGateway } from './support.gateway';
import { SupportService } from './support.service';

@ApiTags('Support')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('support')
export class SupportController {
  constructor(
    private readonly supportService: SupportService,
    private readonly supportGateway: SupportGateway,
  ) {}

  @Post('tickets')
  @UseInterceptors(FileInterceptor('attachment', getMulterConfig(true)))
  @ApiOperation({ summary: 'Criar ticket de suporte para o usuário logado.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async createTicket(
    @Body() data: CreateSupportTicketDto,
    @CurrentUser() user: User,
    @UploadedFile() attachment?: Express.MulterS3.File,
  ) {
    const ticket = await this.supportService.createTicket(
      data,
      user,
      this.mapAttachment(attachment),
    );
    this.supportGateway.notifyTicketCreated(ticket);

    const firstMessage = ticket.messages?.[0];
    if (firstMessage) {
      this.supportGateway.notifyMessageCreated({
        ticketId: ticket.id,
        messageId: firstMessage.id,
        senderId: firstMessage.senderId,
        userId: ticket.userId,
        createdAt: firstMessage.created_at,
      });
    }

    return ticket;
  }

  @Get('tickets')
  @ApiOperation({ summary: 'Listar tickets do usuário logado.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async listMyTickets(@CurrentUser() user: User) {
    return this.supportService.listTicketsForUser(user);
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: 'Detalhar ticket de suporte do usuário logado.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findMyTicketById(@Param('id') id: string, @CurrentUser() user: User) {
    return this.supportService.findTicketByIdForUser(id, user);
  }

  @Post('tickets/:id/messages')
  @UseInterceptors(FileInterceptor('attachment', getMulterConfig(true)))
  @ApiOperation({ summary: 'Enviar mensagem em ticket do usuário logado.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async createMyMessage(
    @Param('id') id: string,
    @Body() data: CreateSupportMessageDto,
    @CurrentUser() user: User,
    @UploadedFile() attachment?: Express.MulterS3.File,
  ) {
    const message = await this.supportService.addMessageByUser(
      id,
      data,
      user,
      this.mapAttachment(attachment),
    );
    const ticket = await this.supportService.findTicketByIdForUser(id, user);

    this.supportGateway.notifyMessageCreated({
      ticketId: id,
      messageId: message.id,
      senderId: message.senderId,
      userId: ticket.userId,
      createdAt: message.created_at,
    });

    this.supportGateway.notifyTicketStatusChanged(ticket);

    return message;
  }

  private mapAttachment(file?: Express.MulterS3.File) {
    if (!file) return undefined;

    return {
      url: file.location || null,
      name: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  }
}
