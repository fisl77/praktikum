import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Voting } from '../Voting/voting.entity';

@Entity()
export class Answer {
  @PrimaryGeneratedColumn()
  answerID: number;

  @Column()
  answer: string;

  @Column()
  number: number;

  @OneToMany(() => Voting, (voting: Voting) => voting.answer)
  votings: Voting[];
}
