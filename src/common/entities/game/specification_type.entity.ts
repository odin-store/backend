import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import Specification from './specifications.entity';

@Entity()
export default class SpecificationType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Specification, (spec) => spec)
  spec: Specification[];
}
