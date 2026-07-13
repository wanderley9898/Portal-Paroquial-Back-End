import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export interface Search<T> {
  filter?: T;
  page?: number;
  per_page?: number;
}

export interface SearchResult<T> {
  items: T;
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export class SearchDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Número da página', example: '1' })
  page?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Registros por página', example: '20' })
  per_page?: number;
}
