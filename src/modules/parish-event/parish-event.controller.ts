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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { getMulterConfig } from 'src/config/multer-config';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesEnum } from 'src/utils/enums';
import {
  CreateParishEventDto,
  SearchParishEventDto,
  UpdateParishEventDto,
} from './dto';
import { ParishEventService } from './parish-event.service';

@ApiTags('Eventos paroquiais')
@Controller('parish-events')
export class ParishEventController {
  constructor(private readonly parishEventService: ParishEventService) {}

  @Get('public')
  async searchPublic(@Query() query: SearchParishEventDto) {
    return this.searchEvents(query);
  }

  @Get('public/:id')
  async findByIdPublic(@Param('id') id: string) {
    return this.parishEventService.findByIdPublic(id);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async search(@Query() query: SearchParishEventDto) {
    return this.searchEvents(query);
  }

  @Post()
  @UseGuards(AuthGuard)
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN, RolesEnum.COMMUNICATION)
  @UseInterceptors(FileInterceptor('image', getMulterConfig(true)))
  @ApiBearerAuth()
  async create(
    @Body() data: CreateParishEventDto,
    @UploadedFile() file?: Express.MulterS3.File,
  ) {
    return this.parishEventService.create({
      ...data,
      image: file?.location ?? data.image,
    });
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @Roles(
    RolesEnum.ADMIN,
    RolesEnum.SUPER_ADMIN,
    RolesEnum.COMMUNICATION,
    RolesEnum.EDITOR,
  )
  @UseInterceptors(FileInterceptor('image', getMulterConfig(true)))
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() data: UpdateParishEventDto,
    @UploadedFile() file?: Express.MulterS3.File,
  ) {
    return this.parishEventService.update(id, {
      ...data,
      image: file?.location ?? data.image,
    });
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async findById(@Param('id') id: string) {
    return this.parishEventService.findById(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN, RolesEnum.COMMUNICATION)
  @ApiBearerAuth()
  async remove(@Param('id') id: string) {
    await this.parishEventService.remove(id);
  }

  private searchEvents(query: SearchParishEventDto) {
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

    return this.parishEventService.search({ page, per_page, filter });
  }
}
