import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsDecimal,
  IsInt,
  IsBoolean,
} from 'class-validator';

export class CreateProfessionalDto {
  @ApiProperty({ example: '12345-SP' })
  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @ApiProperty({ example: 'SP' })
  @IsOptional()
  @IsString()
  registrationState?: string;

  @ApiProperty({ example: 'Cardiologia' })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiProperty({ example: 'Especialista em cirurgia cardíaca...' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ example: 10 })
  @IsOptional()
  @IsInt()
  yearsExperience?: number;

  @ApiProperty({ example: 150.0 })
  @IsOptional()
  @IsDecimal()
  consultationPrice?: number;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
