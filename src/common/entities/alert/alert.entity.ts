import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { AlertType } from './alert-type.entity';

@Entity()
export class Alert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  contents: string;

  @ManyToOne(() => AlertType, (type) => type.alerts)
  type: AlertType;

  @ManyToOne(() => User, (user) => user.alert)
  user: User;
}
