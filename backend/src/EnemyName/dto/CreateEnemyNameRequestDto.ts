import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEnemyNameRequestDto {
  @ApiProperty({ example: 'Hide', description: 'Gegner Art' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'res://enemy.tscn', description: 'Godot Scene-Pfad' })
  @IsString()
  path: string;

  @ApiProperty({
    example: 'enemy-images/hide.png',
    required: false,
    description: 'Pfad zum Bild',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    example: 'A shadow creature that hides.',
    required: false,
    description: 'Lore-Text',
  })
  @IsOptional()
  @IsString()
  lore?: string;
}
