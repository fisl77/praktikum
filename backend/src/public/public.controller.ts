import { Controller, Get, Param } from '@nestjs/common';
import { AdminService } from '../admin/admin.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Game-Client')
@Controller('public')
export class PublicController {
  constructor(private readonly adminService: AdminService) {}

  @Get('game-client/enemy/:id')
  getEnemyById(@Param('id') id: number) {
    return this.adminService.getEnemyById(id);
  }

  @Get('game-client/enemies')
  getEnemies() {
    return this.adminService.getEnemies();
  }

  @Get('game-client/active-enemies')
  getActiveEnemies() {
    return this.adminService.getActiveEnemies();
  }
}
