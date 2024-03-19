import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Alert } from '../alert/alert.entity';
import { Evaluation } from '../evaluation/evaluation.entity';
import { Library } from '../library/library.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  email: string;

  @Column({ nullable: true, default: '/ui/profile/default.png' })
  profile: string;

  @Column({ nullable: true })
  birthdate: Date;

  @Column({ nullable: true })
  currentRefreshToken: string;

  @Column({ nullable: true })
  currentRefreshTokenExp: Date;

  @OneToMany(() => Alert, (alert) => alert.user)
  alert: Alert[];

  @OneToMany(() => Library, (Library) => Library.user)
  library: Library[];

  @OneToMany(() => Evaluation, (evaluation) => evaluation.user)
  evaluations: Evaluation;
}
