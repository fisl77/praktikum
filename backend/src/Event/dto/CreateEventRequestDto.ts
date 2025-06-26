import { ApiProperty } from '@nestjs/swagger';
import { EnemieType } from './EnemieType';

export class CreateEventRequestDto {
  @ApiProperty({ example: '2025-04-10T10:00:00Z' })
  startTime: Date;

  @ApiProperty({ example: '2025-04-10T12:00:00Z' })
  endTime: Date;

  @ApiProperty({
    type: [Number],
    example: [1],
    description: 'Liste von Level-IDs, die diesem Event zugeordnet sind',
  })
  levelIDs: number[];

  @ApiProperty({
    example: [{ enemyID: 1, quantity: 5 }],
    description: 'Gegner mit Menge',
  })
  enemies: { enemyID: number; quantity: number; type: EnemieType }[];
}
