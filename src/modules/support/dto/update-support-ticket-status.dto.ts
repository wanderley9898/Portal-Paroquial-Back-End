import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { SupportTicketStatus } from 'src/utils/enums';

export class UpdateSupportTicketStatusDto {
  @ApiProperty({
    enum: SupportTicketStatus,
    example: SupportTicketStatus.IN_PROGRESS,
  })
  @IsEnum(SupportTicketStatus)
  status: SupportTicketStatus;
}
