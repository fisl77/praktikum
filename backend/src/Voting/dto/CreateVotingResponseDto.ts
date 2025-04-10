import { ApiProperty } from '@nestjs/swagger';

export class CreateVotingResponseDto {
  @ApiProperty({ example: true })
  ok: boolean;

  constructor(ok: boolean) {
    this.ok = ok;
  }
}
