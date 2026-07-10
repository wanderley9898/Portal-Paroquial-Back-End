import { IsEmail, IsString } from 'class-validator';

export class RequestVerifyCodeDto {
  @IsEmail()
  email: string;

  @IsString()
  token: string;
}
