import { ApiProperty } from '@nestjs/swagger';

export class MarkVoteEndedRequestDto {
  @ApiProperty({ example: 1, description: 'Die ID der zu beendenden Umfrage' })
  questionnaireID: number;
}
