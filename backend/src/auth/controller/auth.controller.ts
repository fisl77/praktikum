import {
  Controller,
  Post,
  Body,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminAuthService } from '../auth/auth.service';
import { LoginRequestDto } from '../dto/LoginRequestDto';
import { LoginResponseDto } from '../dto/LoginResponseDto';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AdminAuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Admin Login' })
  @ApiResponse({ status: 201, type: LoginResponseDto })
  async login(
    @Body() dto: LoginRequestDto,
    @Req() req: Request,
  ): Promise<LoginResponseDto> {
    return this.authService.login(dto, req);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout' })
  async logout(@Req() req: Request) {
    if (!req.session?.user) {
      throw new UnauthorizedException('Not logged in');
    }

    return this.authService.logout(req);
  }
}
