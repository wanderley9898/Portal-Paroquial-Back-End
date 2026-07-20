import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { NewsCategoryEnum } from 'src/utils/enums';

export class CreateNewsDto {
  @ApiProperty({
    example: 'Novena de Nossa Senhora do Carmo',
    description: 'Título da notícia',
    maxLength: 150,
  })
  @IsString()
  @MaxLength(150)
  title: string;

  @ApiPropertyOptional({
    example: 'Participe conosco de mais um dia da novena.',
    description: 'Subtítulo da notícia',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  subtitle?: string;

  @ApiProperty({
    example:
      'A comunidade está convidada para participar da novena que acontecerá durante toda a semana...',
    description: 'Conteúdo completo da notícia',
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    example: 'https://meusite.com/uploads/capa.jpg',
    description: 'Imagem principal da notícia',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  coverImage?: string;

  @ApiPropertyOptional({
    example: 'https://meusite.com/uploads/thumb.jpg',
    description: 'Miniatura da notícia',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  thumbnail?: string;

  @ApiProperty({
    enum: NewsCategoryEnum,
    example: NewsCategoryEnum.NOVENA,
    description: 'Categoria da notícia',
  })
  @IsEnum(NewsCategoryEnum)
  category: NewsCategoryEnum;

  @ApiPropertyOptional({
    example: true,
    default: false,
    description: 'Destacar a notícia na página inicial',
  })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({
    example: true,
    default: true,
    description: 'Define se a notícia será publicada',
  })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({
    example: '2026-07-13T19:00:00.000Z',
    description: 'Data de publicação',
  })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @ApiPropertyOptional({
    example: '2026-08-13T19:00:00.000Z',
    description: 'Data de expiração da notícia',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({
    example: 'https://www.youtube.com/watch?v=xxxxxxxx',
    description: 'Link para vídeo do YouTube',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  youtubeUrl?: string;

  @ApiPropertyOptional({
    example: 'https://paroquia.com.br/inscricao',
    description: 'Link externo relacionado',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  externalUrl?: string;

  @ApiPropertyOptional({
    example: ['novena', 'nossa senhora', 'julho'],
    description: 'Tags da notícia',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
