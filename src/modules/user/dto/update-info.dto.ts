import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateInfoDto {
  @IsOptional()
  @IsUUID()
  @ApiProperty({ example: 2, required: false })
  readonly id?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'url de imagem' })
  readonly avatarUrl?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Jhon' })
  readonly name?: string;

  @IsEmail()
  @IsOptional()
  @ApiProperty({ example: 'jhon@email.com', required: false })
  readonly email?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '123454545' })
  readonly document?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '123454545' })
  readonly phone?: string;
}
