import { Module } from '@nestjs/common';
import { AuthController } from '../controller/auth.controller';
import { AdminAuthService } from '../auth/auth.service';

@Module({
  controllers: [AuthController],
  providers: [AdminAuthService],
  exports: [],
})
export class AuthModule {}
