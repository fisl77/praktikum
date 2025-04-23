import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateEventRequestDto } from './CreateEventRequestDto';

export class UpdateEventRequestDto extends CreateEventRequestDto {
  @ApiProperty({
    example: 3,
    description: 'Die ID des Events, das aktualisiert werden soll',
  })
  @IsInt()
  eventID: number;
}
