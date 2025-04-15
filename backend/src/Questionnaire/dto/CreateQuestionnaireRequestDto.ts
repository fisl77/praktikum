import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class CreateQuestionnaireRequestDto {
  @ApiProperty({ example: 'Was soll passieren?' })
  question: string;

  @ApiProperty({ example: '2025-04-10T10:00:00Z' })
  startTime: Date;

  @ApiProperty({ example: '2025-04-10T12:00:00Z' })
  endTime: Date;


  @ApiProperty({
    example: [
      { answer: 'Option A', number: 0 },
      { answer: 'Option B', number: 0 },
    ],
  })
  answers: { answer: string; number: number }[];
}
