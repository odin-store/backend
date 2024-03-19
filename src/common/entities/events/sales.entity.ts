import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Game } from '../game/game.entity';

@Entity()
export class GameSales {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @ManyToMany(() => Game, (game) => game)
  games: Game[];
}
