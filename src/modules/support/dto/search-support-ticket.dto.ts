import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { SupportTicketStatus, SupportTicketType } from 'src/utils/enums';

export class SearchSupportTicketDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  per_page?: number;

  @ApiPropertyOptional({ enum: SupportTicketStatus })
  @IsOptional()
  @IsEnum(SupportTicketStatus)
  status?: SupportTicketStatus;

  @ApiPropertyOptional({ enum: SupportTicketType })
  @IsOptional()
  @IsEnum(SupportTicketType)
  type?: SupportTicketType;

  @ApiPropertyOptional({ example: '15ef8b5f-4fa5-4633-95b6-0b8ffb72dc5f' })
  @IsOptional()
  @IsUUID('4')
  userId?: string;

  @ApiPropertyOptional({ example: 'joão bug login' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;
}
