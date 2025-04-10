import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestionnaireResponseDto {
  @ApiProperty({ example: true })
  ok: boolean;

  constructor(ok: boolean) {
    this.ok = ok;
  }
}
