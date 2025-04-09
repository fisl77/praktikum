import { IsString } from 'class-validator';

export class CreateLevelRequestDto {
  @IsString()
  name: string;
}
