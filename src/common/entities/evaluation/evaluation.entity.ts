import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Game } from '../game/game.entity';
import { User } from '../user/user.entity';

@Entity()
export class Evaluation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  star: number;

  @Column()
  recommend: boolean;

  @Column()
  difficulty: number;

  @Column()
  theme: number;

  @Column()
  visual: number;

  @ManyToOne(() => Game, (game) => game)
  game: Game;

  @ManyToOne(() => User, (user) => user)
  user: User;
}
