import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '12345678' })
  readonly oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '12345678' })
  readonly newPassword: string;
}
