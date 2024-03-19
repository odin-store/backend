import { IsNotEmpty } from 'class-validator';

export class GameGenerateDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  price: number;
}
