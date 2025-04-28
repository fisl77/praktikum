import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Questionnaire } from '../Questionnaire/questionnaire.entity';
import { Answer } from '../Answer/answer.entity';
import { CreateQuestionnaireRequestDto } from '../Questionnaire/dto/CreateQuestionnaireRequestDto';
import fetch from 'node-fetch';

@Injectable()
export class BotPublicService {
  constructor(
    @InjectRepository(Questionnaire)
    private questionnaireRepo: Repository<Questionnaire>,
    @InjectRepository(Answer)
    private answerRepo: Repository<Answer>,
  ) {}

  async startAndTrackPoll(dto: CreateQuestionnaireRequestDto) {
    const { question, startTime, endTime, answers, channelId } = dto;

    // 1️⃣ Datenbank speichern
    const questionnaire = await this.questionnaireRepo.save({
      question,
      startTime,
      endTime,
      isLive: true,
    });

    const answerEntities = answers.map((a) =>
      this.answerRepo.create({ ...a, questionnaire }),
    );
    await this.answerRepo.save(answerEntities);

    // 2️⃣ Bot triggern (fester Wert statt .env)
    const BOT_URL = 'http://localhost:3333';
    const API_KEY = '37392788-5fa3-4aa3-aea9-608d7d1835e1';

    const botResponse = await fetch(`${BOT_URL}/start-poll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({
        question,
        answers,
        channelId,
        endTime,
      }),
    });

    if (!botResponse.ok) {
      const errorText = await botResponse.text();
      console.error('Fehler beim Triggern des Bots:', errorText);
      throw new Error('Bot konnte nicht benachrichtigt werden');
    }

    // 3️⃣ Votes automatisch überwachen
    this.scheduleVoteTracking(questionnaire.questionnaireID, new Date(endTime));

    return {
      success: true,
      id: questionnaire.questionnaireID,
    };
  }

  private scheduleVoteTracking(questionnaireID: number, endTime: Date) {
    const interval = setInterval(async () => {
      const now = new Date();
      if (now >= endTime) {
        clearInterval(interval);

        await this.questionnaireRepo.update(
          { questionnaireID },
          { isLive: false },
        );

        console.log(`Umfrage ${questionnaireID} wurde automatisch beendet.`);
        return;
      }

      console.log(`Tracking läuft für Umfrage ${questionnaireID} ...`);
    }, 60_000);
  }
}
