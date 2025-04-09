import { IsString, IsDate } from 'class-validator';

export class CreateQuestionnaireRequestDto {
  @IsString()
  question: string;

  @IsDate()
  startTime: Date;

  @IsDate()
  endTime: Date;
}
