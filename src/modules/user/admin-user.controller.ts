import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
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
import { AuthGuard } from 'src/guards/auth.guard';
import { AdminUserService } from './admin-user.service';
import { CreateUserDto } from './dto/create.dto';
import { SearchUserDto } from './dto/search.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Admin Users')
@Controller('admin/users')
export class AdminUserController {
  constructor(private readonly service: AdminUserService) {}

  /*
  CREATE
  */
  @UseGuards(AdminGuard)
  @Post()
  @UseInterceptors(FileInterceptor('avatar', getMulterConfig(true)))
  @ApiBearerAuth()
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async create(
    @Body() data: CreateUserDto,
    @UploadedFile() file: Express.MulterS3.File,
  ) {
    return this.service.create({
      ...data,
      avatarUrl: file ? file.location : undefined,
    });
  }

  /*
  FIND BY ID
  */
  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiBearerAuth()
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  /*
  SEARCH
  */
  @UseGuards(AuthGuard)
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Página de resultado',
  })
  @ApiQuery({
    name: 'per_page',
    required: false,
    description: 'Quantidade de itens',
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    description: 'Filtro de busca',
  })
  @ApiOperation({
    summary: 'Listar usuários',
  })
  @Get()
  @ApiBearerAuth()
  async search(@Query() query: SearchUserDto, @CurrentUser() user: User) {
    const filter = query?.filter ? query.filter : {};
    const page = query?.page ? Number(query.page) : 1;
    const per_page = query?.per_page ? Number(query.per_page) : 10;
    return this.service.search(
      {
        page,
        filter,
        per_page,
      },
      user,
    );
  }

  /*
  UPDATE
  */
  @UseGuards(AdminGuard)
  @Put(':id')
  @UseInterceptors(FileInterceptor('avatar', getMulterConfig(true)))
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() data: UpdateUserDto,
    @UploadedFile() file: Express.MulterS3.File,
  ) {
    return this.service.update(id, {
      ...data,
      avatarUrl: file ? file.location : undefined,
    });
  }

  /*
  UPDATE PASSWORD
  */
  @UseGuards(AdminGuard)
  @Put(':id/password')
  @ApiBearerAuth()
  async updatePassword(
    @Param('id') id: string,
    @Body() data: UpdateUserPasswordDto,
  ) {
    return this.service.updatePassword(id, data);
  }

  /*
  DELETE
  */
  @UseGuards(AdminGuard)
  @HttpCode(204)
  @Delete(':id')
  @ApiBearerAuth()
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
