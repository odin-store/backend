import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Game } from '../game/game.entity';

@Entity()
export class Banners {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  logo: string;

  @Column()
  content: string;

  @ManyToOne(() => Game, (game) => game.banner)
  game: Game;
}
