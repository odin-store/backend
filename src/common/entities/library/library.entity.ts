import {
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Game } from '../game/game.entity';
import { User } from '../user/user.entity';

@Entity()
export class Library {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  playtime: number;

  @Column()
  last_play: Date;

  @ManyToOne(() => User, (user) => user.library)
  user: User;

  @ManyToOne(() => Game, (game) => game.library)
  game: Game;
}
