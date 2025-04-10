import { ApiProperty } from '@nestjs/swagger';

export class CreateLevelResponseDto {
  @ApiProperty({ example: true })
  ok: boolean;

  constructor(ok: boolean) {
    this.ok = ok;
  }
}
