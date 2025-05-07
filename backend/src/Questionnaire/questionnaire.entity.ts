import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Voting } from '../Voting/voting.entity';
import { Answer } from '../Answer/answer.entity';

@Entity()
export class Questionnaire {
  @PrimaryGeneratedColumn()
  questionnaireID: number;

  @Column()
  question: string;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column({ default: false })
  isLive: boolean;

  @OneToMany(() => Voting, (voting: Voting) => voting.questionnaire)
  votings: Voting[];

  @OneToMany(() => Answer, (a) => a.questionnaire)
  answers: Answer[];

  @Column()
  channelId: string;
}
