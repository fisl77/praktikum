import { ApiProperty } from '@nestjs/swagger';

export class CreateEventLevelResponseDto {
  @ApiProperty({ example: true })
  ok: boolean;

  constructor(ok: boolean) {
    this.ok = ok;
  }
}
