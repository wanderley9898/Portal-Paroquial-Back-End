import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { RolesNameType } from 'src/utils/enums';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Outro usuário' })
  readonly name: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'jhon@doe.com' })
  readonly email: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '12345678' })
  password: string;

  @IsString()
  @IsOptional()
  @MaxLength(18)
  @ApiProperty({ example: '123.456.789.09' })
  readonly document: string; // Cnpj.

  @IsString()
  @IsOptional()
  @MaxLength(20)
  readonly phone: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'admin' })
  readonly role: RolesNameType;

  @IsUUID()
  @IsOptional()
  @ApiProperty({ example: 'enterpriseId' })
  readonly enterpriseId: string;

  @IsUUID()
  @IsOptional()
  @ApiProperty({ example: 'schoolId' })
  readonly schoolId: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'url' })
  readonly avatarUrl: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ example: true })
  readonly isActive?: boolean;
}
