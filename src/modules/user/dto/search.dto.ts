import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { RolesEnum } from 'src/utils/enums';

export class SearchUserFilterDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  document?: string;

  @IsEnum(RolesEnum)
  @IsOptional()
  role?: RolesEnum;
}

export class SearchUserDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @ApiPropertyOptional({ example: 1 })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @ApiPropertyOptional({ example: 10 })
  per_page?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => SearchUserFilterDto)
  filter?: SearchUserFilterDto;
}
