import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEnemyRequestDto {
  @ApiProperty({ example: 1, description: 'ID des Namens' })
  @IsInt()
  nameID: number;

  @ApiProperty({ example: 2, description: 'ID des Typs' })
  @IsInt()
  typeID: number;
}
