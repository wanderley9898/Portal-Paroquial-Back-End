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
import { BroadcastStatusEnum } from 'src/utils/enums';

export class SearchBroadcastFilterDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Busca por título ou descrição',
    example: 'Missa',
  })
  q?: string;

  @IsOptional()
  @IsEnum(BroadcastStatusEnum)
  @ApiPropertyOptional({
    enum: BroadcastStatusEnum,
    description: 'Filtrar por status da transmissão',
    example: BroadcastStatusEnum.UPCOMING,
  })
  status?: BroadcastStatusEnum;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Filtrar transmissões em destaque',
    example: true,
  })
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Filtrar transmissões publicadas',
    example: true,
  })
  published?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Filtrar apenas transmissões visíveis ao público',
    example: true,
  })
  onlyVisible?: boolean;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    description: 'ID do responsável pela transmissão',
    example: '7b2b9d0c-5a5e-4c18-b90c-fbe7d40f92f3',
  })
  authorId?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({
    description: 'Data inicial da transmissão',
    example: '2026-08-01T00:00:00.000Z',
  })
  scheduledFrom?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({
    description: 'Data final da transmissão',
    example: '2026-08-31T23:59:59.999Z',
  })
  scheduledTo?: string;
}

export class SearchBroadcastDto extends SearchDto {
  @IsOptional()
  @ApiPropertyOptional({
    type: SearchBroadcastFilterDto,
    description: 'Filtros da pesquisa de transmissões',
  })
  filter?: SearchBroadcastFilterDto;
}
