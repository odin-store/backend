import { IsNotEmpty } from 'class-validator';

export class GameUploadDto {
  @IsNotEmpty()
  game_id: number;

  @IsNotEmpty()
  version_name: string;
}
