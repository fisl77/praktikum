import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEnemyTypeRequestDto {
  @ApiProperty({
    example: 'default',
    description: 'Typ des Gegners (z.B. default, strong, weak)',
  })
  @IsString()
  type: string;
}
