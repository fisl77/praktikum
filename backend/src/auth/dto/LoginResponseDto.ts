import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...',
    description: 'JWT Access Token',
  })
  accessToken: string;

  constructor(token: string) {
    this.accessToken = token;
  }
}
