import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Country } from './country.entity';
import { Game } from '../game/game.entity';

@Entity()
export class Languages {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @OneToMany(() => Country, (country) => country.language)
  countries: Country[];

  @ManyToMany(() => Game, (game) => game.textSupport)
  textSupport: Game[];

  @ManyToMany(() => Game, (game) => game.audioSupport)
  audioSupport: Game[];
}
