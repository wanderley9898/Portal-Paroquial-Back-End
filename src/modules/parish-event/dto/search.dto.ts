import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

import { SearchDto } from 'src/@types/search.type';
import { NewsCategoryEnum } from 'src/utils/enums';

export class SearchParishEventFilterDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'missa' })
  q?: string;

  @IsOptional()
  @IsEnum(NewsCategoryEnum)
  @ApiPropertyOptional({ enum: NewsCategoryEnum })
  category?: NewsCategoryEnum;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ example: '2026-09-01' })
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ example: '2026-09-30' })
  dateTo?: string;
}

export class SearchParishEventDto extends SearchDto {
  @IsOptional()
  @ApiPropertyOptional({ type: SearchParishEventFilterDto })
  filter?: SearchParishEventFilterDto;
}
