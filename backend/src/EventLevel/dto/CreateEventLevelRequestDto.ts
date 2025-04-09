import { IsInt } from 'class-validator';

export class CreateEventLevelRequestDto {
  @IsInt()
  eventID: number;

  @IsInt()
  levelID: number;
}
