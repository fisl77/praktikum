import { ApiProperty } from '@nestjs/swagger';

export class CreateEventResponseDto {
  @ApiProperty({
    example: true,
    description: 'Ob das Event erfolgreich erstellt wurde',
  })
  ok: boolean;

  constructor(ok: boolean) {
    this.ok = ok;
  }
}

