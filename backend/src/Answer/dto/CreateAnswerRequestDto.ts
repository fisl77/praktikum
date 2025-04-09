import { IsString, IsInt } from 'class-validator';

export class CreateAnswerRequestDto {
  @IsString()
  answer: string;

  @IsInt()
  number: number;
}
