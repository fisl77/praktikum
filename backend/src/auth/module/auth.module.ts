import { Module } from '@nestjs/common';
import { AuthController } from '../controller/auth.controller';
import { AuthService } from '../auth/auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  exports: [],
})
export class AuthModule {}
