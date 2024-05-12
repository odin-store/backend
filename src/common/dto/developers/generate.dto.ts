import { IsNotEmpty } from 'class-validator';

export class GenerateDeveloperDto {
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  desc: string;
}
