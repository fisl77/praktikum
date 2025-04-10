import { IsString, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestionnaireRequestDto {
  @ApiProperty({
    example: 'Wie soll das Event heißen?',
    description: 'Die Frage an die Community',
  })
  @IsString()
  question: string;

  @ApiProperty({ example: '2025-04-10T10:00:00.000Z' })
  @IsDate()
  startTime: Date;

  @ApiProperty({ example: '2025-04-10T12:00:00.000Z' })
  @IsDate()
  endTime: Date;
}
