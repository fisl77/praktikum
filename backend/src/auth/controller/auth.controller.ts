import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { Request } from 'express';
import { LoginRequestDto } from '../dto/LoginRequestDto';
import { LoginResponseDto } from '../dto/LoginResponseDto';

@ApiTags('Anmelden/Abmelden')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Admin Login' })
  @ApiResponse({ status: 201, type: LoginResponseDto })
  async login(
    @Body() dto: LoginRequestDto,
    @Req() req: Request,
  ): Promise<LoginResponseDto> {
    await this.authService.login(dto.username, dto.password, req);

    if (!req.session?.user) {
      throw new UnauthorizedException('Login fehlgeschlagen');
    }

    // Einfaches Dummy-Token (optional!)
    return new LoginResponseDto('dummy-token');
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
