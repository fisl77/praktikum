import { IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnswerRequestDto {
  @ApiProperty({
    example: 'Option A',
    description: 'Antworttext für die Abstimmung',
  })
  @IsString()
  answer: string;

  @ApiProperty({ example: 1, description: 'Fortlaufende Nummer der Antwort' })
  @IsInt()
  number: number;
}
