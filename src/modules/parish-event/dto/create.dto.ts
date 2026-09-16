import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

import { NewsCategoryEnum } from 'src/utils/enums';

export class CreateParishEventDto {
  @ApiProperty({ example: 'Missa de domingo', maxLength: 150 })
  @IsString()
  @MaxLength(150)
  name: string;

  @ApiProperty({ example: 'Celebração da comunidade paroquial.' })
  @IsString()
  description: string;

  @ApiProperty({ example: '2026-09-20', description: 'Data no formato ISO' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: '19:00', description: 'Horário no formato HH:mm' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  time: string;

  @ApiPropertyOptional({
    example: '20:30',
    description: 'Horário no formato HH:mm',
  })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  endTime?: string;

  @ApiProperty({ example: 'Igreja Matriz', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  location: string;

  @ApiProperty({ example: 'Pe. João Silva', maxLength: 150 })
  @IsString()
  @MaxLength(150)
  responsible: string;

  @ApiProperty({ enum: NewsCategoryEnum, example: NewsCategoryEnum.MASS })
  @IsEnum(NewsCategoryEnum)
  category: NewsCategoryEnum;

  @ApiPropertyOptional({ example: 'https://paroquia.com.br/evento.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  image?: string;
}
