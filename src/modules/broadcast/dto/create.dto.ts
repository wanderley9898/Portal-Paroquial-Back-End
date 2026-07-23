import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { BroadcastStatusEnum } from 'src/utils/enums';

export class CreateBroadcastDto {
  @ApiProperty({
    example: 'Santa Missa Dominical',
    description: 'Título da transmissão',
    maxLength: 150,
  })
  @IsString()
  @MaxLength(150)
  title: string;

  @ApiPropertyOptional({
    example:
      'Acompanhe ao vivo a celebração da Santa Missa diretamente da matriz.',
    description: 'Descrição da transmissão',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'https://www.youtube.com/watch?v=xxxxxxxx',
    description: 'Link da transmissão no YouTube',
  })
  @IsString()
  @MaxLength(255)
  youtubeUrl: string;

  @ApiPropertyOptional({
    example: 'https://meusite.com/uploads/live-thumb.jpg',
    description: 'Imagem de capa da transmissão',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  thumbnail?: string;

  @ApiProperty({
    enum: BroadcastStatusEnum,
    example: BroadcastStatusEnum.UPCOMING,
    description: 'Status da transmissão',
  })
  @IsEnum(BroadcastStatusEnum)
  status: BroadcastStatusEnum;

  @ApiProperty({
    example: '2026-08-15T19:00:00.000Z',
    description: 'Data e hora programada da transmissão',
  })
  @IsDateString()
  scheduledAt: string;

  @ApiPropertyOptional({
    example: true,
    default: false,
    description: 'Destacar transmissão na página inicial',
  })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({
    example: true,
    default: true,
    description: 'Define se a transmissão estará visível no portal',
  })
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
