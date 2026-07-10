import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSupportMessageDto {
  @ApiProperty({
    example: 'Poderia informar em qual navegador isso ocorreu?',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  message?: string;
}
