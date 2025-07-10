import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto {
  @ApiProperty({ example: 'admin', description: 'Benutzername des Admins' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'admin123', description: 'Passwort des Admins' })
  @IsString()
  password: string;
}
