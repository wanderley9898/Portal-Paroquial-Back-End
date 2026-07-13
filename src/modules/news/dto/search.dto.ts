import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { SearchDto } from 'src/@types/search.type';
import { NewsCategoryEnum } from 'src/utils/enums';

export class SearchNewsFilterDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Busca por título, subtítulo ou conteúdo',
    example: 'novena',
  })
  q?: string;

  @IsOptional()
  @IsEnum(NewsCategoryEnum)
  @ApiPropertyOptional({
    enum: NewsCategoryEnum,
    description: 'Filtrar por categoria',
    example: NewsCategoryEnum.NOVENA,
  })
  category?: NewsCategoryEnum;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Filtrar notícias em destaque',
    example: true,
  })
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Filtrar notícias publicadas',
    example: true,
  })
  published?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Filtrar notícias visíveis para o público',
    example: true,
  })
  onlyVisible?: boolean;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    description: 'ID do autor da notícia',
    example: '7b2b9d0c-5a5e-4c18-b90c-fbe7d40f92f3',
  })
  authorId?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({
    description: 'Data inicial de publicação',
    example: '2026-07-01T00:00:00.000Z',
  })
  publishedFrom?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({
    description: 'Data final de publicação',
    example: '2026-07-31T23:59:59.999Z',
  })
  publishedTo?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Filtrar por tag',
    example: 'novena',
  })
  tag?: string;
}

export class SearchNewsDto extends SearchDto {
  @IsOptional()
  @ApiPropertyOptional({
    type: SearchNewsFilterDto,
    description: 'Filtros da pesquisa de notícias',
  })
  filter?: SearchNewsFilterDto;
}
