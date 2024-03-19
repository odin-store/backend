import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Specification from './specifications.entity';
import { Genre } from './genre.entity';
import { Platform } from './platforms.entity';
import { platform } from 'os';
import { Banners } from '../events/banner.entity';
import { Library } from '../library/library.entity';
import { GameRate } from './rate.entity';
import { Evaluation } from '../evaluation/evaluation.entity';
import { Languages } from '../countries/languages.entity';
import { GameSales } from '../events/sales.entity';

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  price: number;

  @Column()
  star_rates: number;

  @Column()
  star_rates_count: number;

  @Column()
  is_public: boolean;

  @Column()
  is_judging: boolean;

  @ManyToMany(() => Genre, (genre) => genre.games)
  genres: Genre[];

  @ManyToMany(() => Specification, (spec) => spec.min)
  spec_min: Specification[];

  @ManyToMany(() => Specification, (spec) => spec.max)
  spec_max: Specification[];

  @ManyToMany(() => Platform, (platform) => platform.games)
  platforms: Platform[];

  @ManyToMany(() => GameRate, (rate) => rate.games)
  rates: GameRate[];

  @ManyToMany(() => Languages, (language) => language.textSupport)
  textSupport: Languages[];

  @ManyToMany(() => Languages, (language) => language.audioSupport)
  audioSupport: Languages[];

  @ManyToMany(() => GameSales, (sales) => sales.games)
  sales: GameSales[];

  @OneToMany(() => Banners, (banner) => banner.game)
  banner: Banners[];

  @OneToMany(() => Library, (library) => library.game)
  library: Library[];

  @OneToMany(() => Evaluation, (evaluation) => evaluation.game)
  evaluation: Evaluation[];
}
