import { IsDate } from 'class-validator';

export class CreateEventRequestDto {
  @IsDate()
  startTime: Date;

  @IsDate()
  endTime: Date;
}
