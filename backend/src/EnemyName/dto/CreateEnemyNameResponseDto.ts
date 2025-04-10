import { ApiProperty } from '@nestjs/swagger';

export class CreateEnemyNameResponseDto {
  @ApiProperty({ example: true })
  ok: boolean;

  constructor(ok: boolean) {
    this.ok = ok;
  }
}
