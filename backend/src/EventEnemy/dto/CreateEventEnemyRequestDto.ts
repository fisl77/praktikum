import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventEnemyRequestDto {
  @ApiProperty({ example: 1, description: 'ID des Events' })
  @IsInt()
  eventID: number;

  @ApiProperty({ example: 2, description: 'ID des Gegners' })
  @IsInt()
  enemyID: number;

  @ApiProperty({ example: 5, description: 'Anzahl des Gegners im Event' })
  @IsInt()
  quantity: number;
}
