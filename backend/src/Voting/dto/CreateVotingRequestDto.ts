import { IsInt } from 'class-validator';

export class CreateVotingRequestDto {
  @IsInt()
  questionnaireID: number;

  @IsInt()
  answerID: number;
}
