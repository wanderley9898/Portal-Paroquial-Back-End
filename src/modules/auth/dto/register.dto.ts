import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Equals,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @ApiProperty({
    example: 'João da Silva',
    description: 'Nome completo do usuário',
  })
  readonly name: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    example: 'joao@example.com',
    description: 'Email do usuário',
  })
  readonly email: string;

  @IsOptional()
  @IsPhoneNumber('BR')
  @ApiProperty({
    example: '+5511999999999',
    description: 'Telefone do usuário (opcional)',
    required: false,
  })
  readonly phone?: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @ApiProperty({
    example: 'senha123',
    description: 'Senha do usuário (mínimo 6 caracteres)',
  })
  readonly password: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '123.456.789-00',
    description: 'CPF do usuário (opcional)',
    required: false,
  })
  readonly document?: string;

  @IsOptional()
  @IsBoolean()
  @Equals(true)
  @ApiPropertyOptional({
    example: true,
    description:
      'Confirmação única de aceite dos Termos, Política de Privacidade e Cookies',
    required: false,
  })
  readonly acceptedLegal?: boolean;

  @IsOptional()
  @IsBoolean()
  @Equals(true)
  @ApiPropertyOptional({
    example: true,
    description: 'Campo legado: confirmação de aceite dos Termos de Uso',
    required: false,
  })
  readonly acceptedTerms?: boolean;

  @IsOptional()
  @IsBoolean()
  @Equals(true)
  @ApiPropertyOptional({
    example: true,
    description:
      'Campo legado: confirmação de aceite da Política de Privacidade',
    required: false,
  })
  readonly acceptedPrivacy?: boolean;

  @IsOptional()
  @IsBoolean()
  @Equals(true)
  @ApiPropertyOptional({
    example: true,
    description: 'Campo legado: confirmação de aceite da Política de Cookies',
    required: false,
  })
  readonly acceptedCookies?: boolean;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '2026-05-27',
    description: 'Versão dos documentos legais aceitos',
    required: false,
  })
  readonly legalVersion?: string;
}
