import { IsString } from 'class-validator';

export class CreateEnemyTypeRequestDto {
  @IsString()
  type: string;
}
