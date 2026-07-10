import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';

import { UserLoggedResponse } from 'src/@types';
import configuration from 'src/config/configuration';
import { User } from 'src/entities/index';
import { Hash } from 'src/helpers/hash.helper';
import { UserService } from 'src/modules/user/user.service';
import { RolesEnum } from 'src/utils/enums';
import { RegisterDto } from './dto/register.dto';
import { SocialLoginDto } from './dto/social-login.dto';

@Injectable()
export class AuthService {
  private readonly DEFAULT_LEGAL_VERSION = '2026-05-27';

  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async login(user: User): Promise<UserLoggedResponse> {
    const payload = { email: user.email, id: user.id };
    return {
      access_token: this.generateToken(payload),
      data: user,
    };
  }

  async loginSocial({
    credential,
    clientId,
  }: SocialLoginDto): Promise<UserLoggedResponse> {
    const client = new OAuth2Client(String(clientId));
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: String(clientId),
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new BadRequestException('Token inválido');
    }

    const { email, name, picture } = payload;

    const user = await this.userService.findByEmail(email);

    return this.login(user);
  }

  async register(registerDto: RegisterDto): Promise<UserLoggedResponse> {
    const hasUnifiedConsent = registerDto.acceptedLegal === true;
    const hasLegacyConsent =
      registerDto.acceptedTerms === true &&
      registerDto.acceptedPrivacy === true &&
      registerDto.acceptedCookies === true;

    if (!hasUnifiedConsent && !hasLegacyConsent) {
      throw new BadRequestException(
        'É necessário aceitar os Termos de Uso, Política de Privacidade e Política de Cookies.',
      );
    }

    // Verificar se o email já existe.
    const existingUser = await this.userService.findByEmail(registerDto.email);

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // Criar o usuário.
    const hashedPassword = Hash.encrypt(registerDto.password);
    const acceptedAt = new Date();
    const legalVersion =
      registerDto.legalVersion?.trim() || this.DEFAULT_LEGAL_VERSION;

    const userData = {
      name: registerDto.name,
      email: registerDto.email,
      phone: registerDto.phone,
      document: registerDto.document,
      password: hashedPassword,
      role: RolesEnum.CLIENT, // Todos os usuários registrados são clientes por padrão.
      isVerified: false, // Precisa verificar email posteriormente.
      termsAcceptedAt: acceptedAt,
      privacyAcceptedAt: acceptedAt,
      cookiesAcceptedAt: acceptedAt,
      termsAcceptedVersion: legalVersion,
      privacyAcceptedVersion: legalVersion,
      cookiesAcceptedVersion: legalVersion,
    };

    const user = await this.userService.create(userData);

    // Fazer login automático após registro.
    delete user.password;
    return this.login(user);
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user: User = await this.userService.findByEmail(email);

    if (!user) {
      throw new BadRequestException('Usuário ou Senha inválida.');
    }

    const isMatch: boolean = Hash.compare(password, user.password);

    if (!isMatch) {
      throw new BadRequestException('Usuário ou Senha inválida.');
    }

    delete user.password;
    return user;
  }

  private generateToken(payload: { email: string; id: string }) {
    return this.jwtService.sign(payload, {
      expiresIn: configuration().jwt.expiresIn,
      secret: configuration().jwt.secret,
    });
  }
}
