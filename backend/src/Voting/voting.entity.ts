import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
} from 'typeorm';
import { Questionnaire } from '../Questionnaire/questionnaire.entity';
import { Answer } from '../Answer/answer.entity';

@Entity()
export class Voting {
  @PrimaryGeneratedColumn()
  votingID: number;

  @Column()
  questionnaireID: number;

  @Column()
  answerID: number;

  @ManyToOne(() => Questionnaire, (q) => q.votings)
  @JoinColumn({ name: 'questionnaireID' })
  questionnaire: Questionnaire;

  @ManyToOne(() => Answer, (a) => a.votings)
  @JoinColumn({ name: 'answerID' })
  answer: Answer;
}
