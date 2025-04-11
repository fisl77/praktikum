import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from '../controller/auth.controller';
import { AdminAuthService } from '../auth/auth.service';

@Module({
  imports: [PassportModule],
  controllers: [AuthController],
  providers: [AdminAuthService],
  exports: [],
})
export class AuthModule {}
