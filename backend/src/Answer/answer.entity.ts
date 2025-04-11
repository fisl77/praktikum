import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Voting } from '../Voting/voting.entity';
import { Questionnaire } from '../Questionnaire/questionnaire.entity';

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

  @ManyToOne(() => Questionnaire, (q) => q.answers, { onDelete: 'CASCADE' })
  questionnaire: Questionnaire;
}
