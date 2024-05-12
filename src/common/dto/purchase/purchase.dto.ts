import { IsEmail, IsNotEmpty } from 'class-validator';

export class PurchaseDto {
  @IsNotEmpty()
  id: string;
}
