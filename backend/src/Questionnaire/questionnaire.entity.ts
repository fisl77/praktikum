import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Voting } from '../Voting/voting.entity';

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

  @OneToMany(() => Voting, (voting: Voting) => voting.questionnaire)
  votings: Voting[];
}
