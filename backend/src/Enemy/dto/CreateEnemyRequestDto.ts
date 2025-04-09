import { IsInt } from 'class-validator';

export class CreateEnemyRequestDto {
  @IsInt()
  nameID: number;

  @IsInt()
  typeID: number;
}
