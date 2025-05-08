import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  Index,
  JoinColumn,
} from 'typeorm';
import { Questionnaire } from '../Questionnaire/questionnaire.entity';
import { Answer } from '../Answer/answer.entity';

@Entity()
@Index(['questionnaireID', 'answerID', 'userId'], { unique: true })
export class Voting {
  @PrimaryGeneratedColumn()
  votingID: number;

  @Column()
  questionnaireID: number;

  @Column()
  answerID: number;

  @Column()
  userId: string;

  @ManyToOne(() => Questionnaire, (q) => q.votings)
  @JoinColumn({ name: 'questionnaireID' })
  questionnaire: Questionnaire;

  @ManyToOne(() => Answer, (a) => a.votings)
  @JoinColumn({ name: 'answerID' })
  answer: Answer;
}
