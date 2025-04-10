import { ApiProperty } from '@nestjs/swagger';

export class CreateEnemyTypeResponseDto {
  @ApiProperty({ example: true })
  ok: boolean;

  constructor(ok: boolean) {
    this.ok = ok;
  }
}
