import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Game } from './game.entity';
import SpecificationType from './specification_type.entity';

@Entity()
export default class Specification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => Game, (game) => game.spec_min)
  min: Game[];

  @ManyToMany(() => Game, (game) => game.spec_max)
  max: Game[];

  @ManyToOne(() => SpecificationType, (type) => type.spec)
  type: Specification;
}
