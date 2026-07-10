import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { getMulterConfig } from 'src/config/multer-config';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from 'src/entities';
import { AdminGuard } from 'src/guards/admin.guard';
import { CreateSupportMessageDto } from './dto/create-support-message.dto';
import { SearchSupportTicketDto } from './dto/search-support-ticket.dto';
import { UpdateSupportTicketStatusDto } from './dto/update-support-ticket-status.dto';
import { SupportGateway } from './support.gateway';
import { SupportService } from './support.service';

@ApiTags('Admin Support')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('admin/support')
export class AdminSupportController {
  constructor(
    private readonly supportService: SupportService,
    private readonly supportGateway: SupportGateway,
  ) {}

  @Get('tickets')
  @ApiOperation({ summary: 'Listar tickets de suporte para administradores.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiQuery({ name: 'page', required: false, description: 'Página' })
  @ApiQuery({
    name: 'per_page',
    required: false,
    description: 'Itens por página',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Status do ticket',
  })
  @ApiQuery({ name: 'type', required: false, description: 'Tipo do ticket' })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filtrar por usuário',
  })
  @ApiQuery({ name: 'q', required: false, description: 'Busca textual' })
  async listTickets(@Query() query: SearchSupportTicketDto) {
    return this.supportService.listTicketsForAdmin(query);
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: 'Detalhar ticket de suporte para administradores.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findTicketById(@Param('id') id: string) {
    return this.supportService.findTicketByIdForAdmin(id);
  }

  @Post('tickets/:id/messages')
  @UseInterceptors(FileInterceptor('attachment', getMulterConfig(true)))
  @ApiOperation({ summary: 'Responder ticket de suporte como administrador.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async createMessage(
    @Param('id') id: string,
    @Body() data: CreateSupportMessageDto,
    @CurrentUser() user: User,
    @UploadedFile() attachment?: Express.MulterS3.File,
  ) {
    const message = await this.supportService.addMessageByAdmin(
      id,
      data,
      user,
      this.mapAttachment(attachment),
    );
    const ticket = await this.supportService.findTicketByIdForAdmin(id);

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

  @Patch('tickets/:id/status')
  @ApiOperation({ summary: 'Atualizar status de um ticket de suporte.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async updateStatus(
    @Param('id') id: string,
    @Body() data: UpdateSupportTicketStatusDto,
    @CurrentUser() user: User,
  ) {
    const ticket = await this.supportService.updateTicketStatusByAdmin(
      id,
      data,
      user,
    );

    this.supportGateway.notifyTicketStatusChanged(ticket);

    return ticket;
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
