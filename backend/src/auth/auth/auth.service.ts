import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginRequestDto } from '../dto/LoginRequestDto';
import { LoginResponseDto } from '../dto/LoginResponseDto';
import { Request } from 'express';

@Injectable()
export class AdminAuthService {
  private readonly adminUser = {
    username: 'admin',
    password: 'admin123',
  };

  async login(dto: LoginRequestDto, req: Request): Promise<LoginResponseDto> {
    const { username, password } = dto;

    if (
      username !== this.adminUser.username ||
      password !== this.adminUser.password
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }
    req.session.user = {
      username,
      role: 'admin',
    };

    return new LoginResponseDto('Session started');
  }

  async logout(req: Request): Promise<{ message: string }> {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) reject(err);
        else resolve({ message: 'Logged out successfully' });
      });
    });
  }

  isAuthenticated(req: Request): boolean {
    return !!req.session.user;
  }
}
