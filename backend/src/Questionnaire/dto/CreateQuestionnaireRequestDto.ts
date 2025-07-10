import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  ValidateIf,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

// Antwort, die vom Client beim Erstellen einer Umfrage mitgegeben wird
export class CreateAnswerDto {
  @ApiProperty({ example: 'Option A' })
  @IsString()
  @IsNotEmpty()
  answer: string;

  @ApiProperty({
    example: 1,
    description: 'Antwortposition in der Umfrage (1, 2, 3, ...)',
    required: false,
  })
  @IsOptional()
  number?: number;
}

// Antwortstruktur, wenn eine Umfrage abgerufen wird
export class GetAnswerDto {
  @ApiProperty({ example: 1 })
  answerID: number;

  @ApiProperty({ example: 'Option A' })
  answer: string;

  @ApiProperty({ example: 12 })
  votes: number;
}

// Response für eine komplette Umfrage inkl. Antworten
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

// DTO für das Erstellen einer neuen Umfrage
export class CreateQuestionnaireRequestDto {
  @ApiProperty({ example: 'Was soll passieren?' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ example: '2025-04-10T10:00:00.000Z' })
  @IsDateString()
  @ValidateIf((obj) => new Date(obj.startTime) > new Date())
  startTime: Date;

  @ApiProperty({ example: '2025-04-10T12:00:00.000Z' })
  @IsDateString()
  @ValidateIf((obj) => new Date(obj.endTime) > new Date(obj.startTime))
  endTime: Date;

  @ApiProperty({
    type: [CreateAnswerDto],
    example: [
      { answer: 'Option A' },
      { answer: 'Option B' },
      { answer: 'Option C' },
    ],
  })
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => CreateAnswerDto)
  answers: CreateAnswerDto[];

  @ApiProperty({
    example: '1364918839699046400',
    description: 'Die Discord-Channel-ID, in der die Umfrage gepostet wird.',
  })
  @IsString()
  @IsNotEmpty()
  channelId: string;
}
