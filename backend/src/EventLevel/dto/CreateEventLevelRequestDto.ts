import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventLevelRequestDto {
  @ApiProperty({ example: 1, description: 'ID des Events' })
  @IsInt()
  eventID: number;

  @ApiProperty({ example: 3, description: 'ID des Levels' })
  @IsInt()
  levelID: number;
}
