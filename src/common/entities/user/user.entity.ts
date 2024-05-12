import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Alert } from '../alert/alert.entity';
import { Evaluation } from '../evaluation/evaluation.entity';
import { Library } from '../library/library.entity';
import { Developer } from '../developer/developer.entity';

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

  @ManyToMany(() => Developer, (developer) => developer.users)
  developer: Developer[];

  @OneToMany(() => Alert, (alert) => alert.user)
  alert: Alert[];

  @OneToMany(() => Library, (Library) => Library.user)
  library: Library[];

  @OneToMany(() => Evaluation, (evaluation) => evaluation.user)
  evaluations: Evaluation;
}
