import { IsString } from 'class-validator';

export class CreateEnemyNameRequestDto {
  @IsString()
  name: string;
}
