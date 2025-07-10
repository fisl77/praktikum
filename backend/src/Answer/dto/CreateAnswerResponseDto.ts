import { ApiProperty } from '@nestjs/swagger';

export class CreateAnswerResponseDto {
  @ApiProperty({ example: true })
  ok: boolean;

  constructor(ok: boolean) {
    this.ok = ok;
  }
}
