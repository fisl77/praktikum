import { ApiProperty } from '@nestjs/swagger';

export class CreateEventEnemyResponseDto {
  @ApiProperty({ example: true })
  ok: boolean;

  constructor(ok: boolean) {
    this.ok = ok;
  }
}
