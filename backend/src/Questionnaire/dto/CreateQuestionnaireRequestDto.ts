import { ApiProperty } from '@nestjs/swagger';

export class CreateAnswerDto {
  @ApiProperty({ example: 'Option A' })
  answer: string;

  @ApiProperty({ example: 1 })
  number: number;
}

export class GetAnswerDto {
  @ApiProperty({ example: 1 })
  answerID: number;

  @ApiProperty({ example: 'Option A' })
  answer: string;

  @ApiProperty({ example: 12 })
  votes: number;
}

export class GetQuestionnaireResponseDto {
  @ApiProperty({ example: 1 })
  questionnaireID: number;

  @ApiProperty({ example: 'Was soll passieren?' })
  question: string;

  @ApiProperty({ example: '2025-04-10T10:00:00.000Z' })
  startTime: Date;

  @ApiProperty({ example: '2025-04-10T12:00:00.000Z' })
  endTime: Date;

  @ApiProperty({ example: true })
  isLive: boolean;

  @ApiProperty({ type: [GetAnswerDto] })
  answers: GetAnswerDto[];
}

export class CreateQuestionnaireRequestDto {
  @ApiProperty({ example: 'Was soll passieren?' })
  question: string;

  @ApiProperty({ example: '2025-04-10T10:00:00.000Z' })
  startTime: Date;

  @ApiProperty({ example: '2025-04-10T12:00:00.000Z' })
  endTime: Date;

  @ApiProperty({ type: [CreateAnswerDto] })
  answers: CreateAnswerDto[];
}