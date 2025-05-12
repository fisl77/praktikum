import { ApiProperty } from '@nestjs/swagger';

class AnswerSummaryDto {
  @ApiProperty()
  answerID: number;

  @ApiProperty()
  answer: string;

  @ApiProperty()
  totalVotes: number;
}

export class GetAllQuestionnairesResponseDto {
  @ApiProperty()
  questionnaireID: number;

  @ApiProperty()
  question: string;

  @ApiProperty()
  startTime: Date;

  @ApiProperty()
  endTime: Date;

  @ApiProperty()
  isLive: boolean;

  @ApiProperty()
  wasPostedToDiscord: boolean;

  @ApiProperty({ type: [AnswerSummaryDto] })
  answers: AnswerSummaryDto[];
}
