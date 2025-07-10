import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVotingRequestDto {
  @ApiProperty({ example: 1, description: 'Frage-ID (Questionnaire)' })
  @IsInt()
  questionnaireID: number;

  @ApiProperty({ example: 2, description: 'Antwort-ID (Answer)' })
  @IsInt()
  answerID: number;
}
