import {
  Body,
  Controller,
  Get,
  ParseFilePipeBuilder,
  Patch,
  Put,
  Req,
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
import { Request } from 'express';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from 'src/entities';
import { AuthGuard } from 'src/guards/auth.guard';
import { UpdateInfoDto } from './dto/update-info.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UserService } from './user.service';

@ApiTags('Usuários')
@Controller('users')
export class UserController {
  constructor(private service: UserService) {}

  @UseGuards(AuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiOperation({
    summary: 'Obter informações do usuário logado.',
  })
  async me(@Req() req: Request) {
    const user = await this.service.findByEmail(req.user.email);

    delete user.password;

    return {
      ...user,
    };
  }

  @UseGuards(AuthGuard)
  @Put('change-password')
  @ApiBearerAuth()
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiOperation({
    summary: 'Obter informações do usuário logado.',
  })
  async updatePassword(
    @Body() data: UpdatePasswordDto,
    @CurrentUser() user: User,
  ) {
    const result = await this.service.updatePassword(data, user);
    delete result.password;

    return result;
  }

  @UseGuards(AuthGuard)
  @Put('profile')
  @ApiBearerAuth()
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiOperation({
    summary: 'Atualizar perfil do usuário logado.',
  })
  async updateProfile(@Body() data: UpdateInfoDto, @CurrentUser() user: User) {
    const result = await this.service.updateInfo(data, user);
    delete result.password;

    return result;
  }

  @UseGuards(AuthGuard)
  @Patch('update-logo')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiBearerAuth()
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiOperation({
    summary: 'Obter informações do usuário logado.',
  })
  async updateAvatar(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 1024 * 1024 * 2,
          message: 'Tamanho máximo permitido de 2MB para foto de logo.',
        })
        .addFileTypeValidator({
          fileType: /(png|jpeg|jpg)/,
        })
        .build({ fileIsRequired: false }),
    )
    avatar: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    const result = await this.service.updateProfilePhoto(avatar, user);
    delete result.password;

    return result;
  }
}
