import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { Request } from 'express';

@ApiTags('Anmelden/Abmelden')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Admin Login' })
  async login(
    @Body('username') username: string,
    @Body('password') password: string,
    @Req() req: Request,
  ): Promise<void> {
    await this.authService.login(username, password, req);
    if (!req.session?.user) {
      throw new UnauthorizedException('Login fehlgeschlagen');
    }
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout' })
  async logout(@Req() req: Request): Promise<void> {
    if (!req.session?.user) {
      throw new UnauthorizedException('Nicht eingeloggt');
    }
    await this.authService.logout(req);
  }

  @Get('check')
  @ApiOperation({ summary: 'Session prüfen' })
  async checkSession(@Req() req: Request) {
    if (req.session?.user) {
      return { message: 'Session aktiv' };
    } else {
      throw new UnauthorizedException('Keine aktive Session');
    }
  }
}
