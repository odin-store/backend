import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PurchaseData {
  @PrimaryGeneratedColumn()
  id: number;
}
