import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Languages } from './languages.entity';

@Entity()
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Languages, (language) => language.countries)
  language: Languages;
}
