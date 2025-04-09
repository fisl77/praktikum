import { IsInt } from 'class-validator';

export class CreateEventEnemyRequestDto {
  @IsInt()
  eventID: number;

  @IsInt()
  enemyID: number;

  @IsInt()
  quantity: number;
}
