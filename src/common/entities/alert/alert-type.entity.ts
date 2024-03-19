import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Alert } from './alert.entity';

@Entity()
export class AlertType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @OneToMany(() => Alert, (alert) => alert.type)
  alerts: Alert[];
}
