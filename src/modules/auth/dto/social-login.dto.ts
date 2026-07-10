import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SocialLoginDto {
  @ApiProperty({
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6...',
    description: 'Google credential token',
  })
  @IsOptional()
  @IsString()
  credential?: string;

  @ApiProperty({
    example: '1234567890-abcdefghijk.apps.googleusercontent.com',
    description: 'Google client ID',
  })
  @IsOptional()
  @IsString()
  clientId?: number;
}
