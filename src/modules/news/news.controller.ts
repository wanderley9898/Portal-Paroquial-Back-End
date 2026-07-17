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
import { CreateNewsDto, SearchNewsDto, UpdateNewsDto } from './dto';
import { NewsService } from './news.service';

@ApiTags('Noticias')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  /**
   * Lista e busca noticias com filtros e paginação.
   */
  @Get('public')
  @ApiOperation({
    summary: 'Listar e buscar noticias',
    description: 'Retorna uma lista paginada de noticias.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'per_page',
    required: false,
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    description: 'Filtros de busca (q, parentId, isActive)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de noticias retornada com sucesso',
  })
  async searchPublic(@Query() query: SearchNewsDto) {
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

    return this.newsService.search({
      page,
      per_page,
      filter: {
        ...filter,
        onlyVisible: true,
      },
    });
  }

  /**
   * Busca uma noticia por ID.
   */
  @Get('public/:id')
  @ApiOperation({
    summary: 'Buscar noticia por ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da noticia',
    example: 'uuid-news',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Noticia encontrada',
  })
  async findByIdPublic(@Param('id') id: string) {
    return this.newsService.findById(id);
  }

  /**
   * Lista e busca noticias com filtros e paginação.
   */
  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Listar e buscar noticias',
    description: 'Retorna uma lista paginada de noticias.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'per_page',
    required: false,
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    description: 'Filtros de busca (q, parentId, isActive)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de noticias retornada com sucesso',
  })
  @ApiBearerAuth()
  async search(@Query() query: SearchNewsDto) {
    const page = query.page ? Number(query.page) : 1;
    const per_page = query.per_page ? Number(query.per_page) : 10;

    let filter = query.filter;
    console.log('filter', filter);

    if (typeof query.filter === 'string') {
      try {
        filter = JSON.parse(query.filter);
      } catch {
        throw new BadRequestException('Filtro inválido');
      }
    }

    return this.newsService.search({
      page,
      per_page,
      filter,
    });
  }

  /**
   * Cria uma nova noticia.
   */
  @Post()
  @UseGuards(AuthGuard)
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN, RolesEnum.COMMUNICATION)
  @ApiOperation({
    summary: 'Criar noticia',
    description: 'Cria uma nova noticia no sistema.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Noticia criada com sucesso',
  })
  @ApiBearerAuth()
  async create(@Body() data: CreateNewsDto, @CurrentUser() user: User) {
    return this.newsService.create(data, user);
  }

  /**
   * Atualiza uma noticia existente.
   */
  @Put(':id')
  @UseGuards(AuthGuard)
  @Roles(
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
    RolesEnum.COMMUNICATION,
    RolesEnum.EDITOR,
  )
  @ApiOperation({
    summary: 'Atualizar noticia',
    description: 'Atualiza os dados de uma noticia existente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da noticia',
    example: 'uuid-news',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Noticia atualizada com sucesso',
  })
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() data: UpdateNewsDto) {
    return this.newsService.update(id, data);
  }

  /**
   * Busca uma noticia por ID.
   */
  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Buscar noticia por ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da noticia',
    example: 'uuid-news',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Noticia encontrada',
  })
  @ApiBearerAuth()
  async findById(@Param('id') id: string) {
    return this.newsService.findById(id);
  }

  /**
   * Remove uma noticia.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN, RolesEnum.COMMUNICATION)
  @ApiOperation({
    summary: 'Remover noticia',
    description: 'Remove uma noticia.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da noticia',
    example: 'uuid-news',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Noticia removida com sucesso',
  })
  @ApiBearerAuth()
  async remove(@Param('id') id: string) {
    await this.newsService.remove(id);
  }
}
