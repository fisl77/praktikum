import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Voting } from '../Voting/voting.entity';
import { Questionnaire } from '../Questionnaire/questionnaire.entity';

@Entity()
export class Answer {
  @PrimaryGeneratedColumn()
  answerID: number;

  @Column()
  answer: string;

  @OneToMany(() => Voting, (voting: Voting) => voting.answer)
  votings: Voting[];

  @ManyToOne(() => Questionnaire, (q) => q.answers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionnaireID' })
  questionnaire: Questionnaire;
}
