// src/Questionnaire/dto/AnswerDto.ts

import { ApiProperty } from '@nestjs/swagger';

export class AnswerDto {
  @ApiProperty({ example: 1 })
  answerID: number;

  @ApiProperty({ example: 'Option A' })
  answer: string;

  @ApiProperty({ example: 5 })
  votes: number;
}