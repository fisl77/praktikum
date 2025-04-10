import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLevelRequestDto {
  @ApiProperty({
    example: 'Wald von Goldenvalley',
    description: 'Name des Levels',
  })
  @IsString()
  name: string;
}
