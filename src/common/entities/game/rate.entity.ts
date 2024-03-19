import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Game } from './game.entity';

@Entity()
export class GameRate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  age: number;

  @Column()
  country: string;

  @ManyToMany(() => Game, (game) => game.rates)
  games: Game[];
}
