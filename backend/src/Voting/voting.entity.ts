import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
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
  questionnaire: Questionnaire;

  @ManyToOne(() => Answer, (a) => a.votings)
  answer: Answer;
}
