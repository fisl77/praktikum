import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthService {
  private readonly adminUser = {
    username: 'admin',
    password: 'admin123',
  };

  async login(username: string, password: string, req: Request): Promise<void> {
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

    console.log('Login erfolgreich:', username);
  }

  async logout(req: Request): Promise<void> {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          reject(new UnauthorizedException('Logout fehlgeschlagen'));
        } else {
          console.log('Logout erfolgreich');
          resolve();
        }
      });
    });
  }

  isAuthenticated(req: Request): boolean {
    return !!req.session.user;
  }
}
