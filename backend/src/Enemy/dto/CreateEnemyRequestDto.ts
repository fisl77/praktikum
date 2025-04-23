import { IsBoolean, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEnemyRequestDto {
  @ApiProperty({ example: 1, description: 'ID des Namens' })
  @IsInt()
  nameID: number;

  @ApiProperty({ example: 2, description: 'ID des Typs' })
  @IsInt()
  typeID: number;

  @ApiProperty({ example: 0.3, description: 'Size of the enemy' })
  @IsInt()
  new_scale: number;

  @ApiProperty({ example: 3, description: 'How many Enemies are spawning' })
  @IsInt()
  max_count: number;
}
