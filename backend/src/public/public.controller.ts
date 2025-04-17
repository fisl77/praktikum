import {
  Controller,
  Get,
  Headers,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminService } from '../admin/admin.service';
import { ApiTags } from '@nestjs/swagger';

const API_KEY = '37392788-5fa3-4aa3-aea9-608d7d1835e1';

@ApiTags('Game-Client')
@Controller('api')
export class PublicController {
  constructor(private readonly adminService: AdminService) {}

  @Get('game-client/enemy/:id')
  async getEnemyById(
    @Headers('x-api-key') apiKey: string,
    @Param('id') id: number,
  ) {
    if (apiKey !== API_KEY) {
      throw new UnauthorizedException('Ungültiger API-Key');
    }

    return await this.adminService.getEnemyById(id);
  }

  @Get('game-client/enemies')
  async getEnemies(@Headers('x-api-key') apiKey: string) {
    if (apiKey !== API_KEY) {
      throw new UnauthorizedException('Ungültiger API-Key');
    }

    return await this.adminService.getEnemies(); // ✅ ALLE Gegner
  }
  @Get('game-client/active-enemies')
  getActiveEnemies(@Headers('x-api-key') apiKey: string) {
    if (apiKey !== API_KEY) {
      throw new UnauthorizedException('Ungültiger API-Key');
    }

    return this.adminService.getActiveEnemies(); // Muss ein JSON sein!
  }
}
