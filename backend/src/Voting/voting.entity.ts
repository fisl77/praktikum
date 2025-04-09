import { Entity, PrimaryColumn, ManyToOne } from 'typeorm';
import { Questionnaire } from '../Questionnaire/questionnaire.entity';
import { Answer } from '../Answer/answer.entity';

@Entity()
export class Voting {
  @PrimaryColumn()
  questionnaireID: number;

  @PrimaryColumn()
  answerID: number;

  @ManyToOne(() => Questionnaire, (q: Questionnaire) => q.votings)
  questionnaire: Questionnaire;

  @ManyToOne(() => Answer, (a: Answer) => a.votings)
  answer: Answer;
}
