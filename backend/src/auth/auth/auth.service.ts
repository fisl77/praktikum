import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginRequestDto } from '../dto/LoginRequestDto';
import { LoginResponseDto } from '../dto/LoginResponseDto';

@Injectable()
export class AdminAuthService {
  // Hardcoded Admin-Creds – optional aus env
  private readonly adminUser = {
    username: 'admin',
    password: 'admin123', // Oder aus ENV!
  };

  constructor(private readonly jwtService: JwtService) {}

  async login(dto: LoginRequestDto): Promise<LoginResponseDto> {
    const { username, password } = dto;

    if (
      username !== this.adminUser.username ||
      password !== this.adminUser.password
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { username, role: 'admin' };

    const token = await this.jwtService.signAsync(payload);

    return new LoginResponseDto(token);
  }
}
