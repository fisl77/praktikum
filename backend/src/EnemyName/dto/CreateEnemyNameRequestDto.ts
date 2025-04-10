import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEnemyNameRequestDto {
  @ApiProperty({ example: 'Hide', description: 'Gegner Art' })
  @IsString()
  name: string;
}
