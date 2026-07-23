import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from 'src/decorators/current-user.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { User } from 'src/entities';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesEnum } from 'src/utils/enums';

import { BroadcastService } from './broadcast.service';
import {
  CreateBroadcastDto,
  SearchBroadcastDto,
  UpdateBroadcastDto,
} from './dto';

@ApiTags('Transmissões')
@Controller('broadcasts')
export class BroadcastController {
  constructor(private readonly broadcastService: BroadcastService) {}

  /**
   * Lista pública
   */
  @Get('public')
  @ApiOperation({
    summary: 'Listar transmissões públicas',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'per_page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'filter',
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de transmissões.',
  })
  async searchPublic(@Query() query: SearchBroadcastDto) {
    const page = query.page ? Number(query.page) : 1;
    const per_page = query.per_page ? Number(query.per_page) : 10;

    let filter = query.filter;

    if (typeof query.filter === 'string') {
      try {
        filter = JSON.parse(query.filter);
      } catch {
        throw new BadRequestException('Filtro inválido');
      }
    }

    return this.broadcastService.search({
      page,
      per_page,
      filter,
    });
  }

  /**
   * Busca pública por ID
   */
  @Get('public/:id')
  @ApiOperation({
    summary: 'Buscar transmissão pública',
  })
  @ApiParam({
    name: 'id',
    example: 'uuid',
  })
  async findByIdPublic(@Param('id') id: string) {
    return this.broadcastService.findById(id);
  }

  /**
   * Lista administrativa
   */
  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar transmissões',
  })
  async search(@Query() query: SearchBroadcastDto) {
    const page = query.page ? Number(query.page) : 1;
    const per_page = query.per_page ? Number(query.per_page) : 10;

    let filter = query.filter;

    if (typeof query.filter === 'string') {
      try {
        filter = JSON.parse(query.filter);
      } catch {
        throw new BadRequestException('Filtro inválido');
      }
    }

    return this.broadcastService.search({
      page,
      per_page,
      filter,
    });
  }

  /**
   * Criar transmissão
   */
  @Post()
  @UseGuards(AuthGuard)
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN, RolesEnum.COMMUNICATION)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Criar transmissão',
  })
  async create(@Body() data: CreateBroadcastDto, @CurrentUser() user: User) {
    return this.broadcastService.create(data, user);
  }

  /**
   * Atualizar transmissão
   */
  @Put(':id')
  @UseGuards(AuthGuard)
  @Roles(
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
    RolesEnum.COMMUNICATION,
    RolesEnum.EDITOR,
  )
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar transmissão',
  })
  @ApiParam({
    name: 'id',
    example: 'uuid',
  })
  async update(@Param('id') id: string, @Body() data: UpdateBroadcastDto) {
    return this.broadcastService.update(id, data);
  }

  /**
   * Buscar transmissão
   */
  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Buscar transmissão',
  })
  @ApiParam({
    name: 'id',
    example: 'uuid',
  })
  async findById(@Param('id') id: string) {
    return this.broadcastService.findById(id);
  }

  /**
   * Remover transmissão
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN, RolesEnum.COMMUNICATION)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remover transmissão',
  })
  @ApiParam({
    name: 'id',
    example: 'uuid',
  })
  async remove(@Param('id') id: string) {
    await this.broadcastService.remove(id);
  }
}
