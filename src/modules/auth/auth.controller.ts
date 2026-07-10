import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SocialLoginDto } from './dto/social-login.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Login',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request.',
  })
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(body.email, body.password);
    return this.authService.login(user);
  }

  @Post('login-social')
  @ApiOperation({
    summary: 'Social Login (Google)',
  })
  @ApiResponse({
    status: 200,
    description: 'User authenticated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid social login credentials',
  })
  async loginSocial(@Body() body: SocialLoginDto) {
    return this.authService.loginSocial(body);
  }

  @Post('register')
  @ApiOperation({
    summary: 'Register new user',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Email already exists or validation error',
  })
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }
}
