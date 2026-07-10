import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { SupportTicketType } from 'src/utils/enums';

export class CreateSupportTicketDto {
  @ApiProperty({ enum: SupportTicketType, example: SupportTicketType.BUG })
  @IsEnum(SupportTicketType)
  type: SupportTicketType;

  @ApiProperty({
    example: 'Ao abrir a tela de campanhas, o botão de criar não responde.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(5000)
  message?: string;
}
