import { ApiProperty } from '@nestjs/swagger';

export class CreateEnemyResponseDto {
  @ApiProperty({ example: true })
  ok: boolean;

  constructor(ok: boolean) {
    this.ok = ok;
  }
}
