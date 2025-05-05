import { Controller, Post, Body, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Questionnaire } from '../Questionnaire/questionnaire.entity';
import { Answer } from '../Answer/answer.entity';
import { CreateQuestionnaireRequestDto } from '../Questionnaire/dto/CreateQuestionnaireRequestDto';
import { BotService } from '../bot/bot.service';

@Controller('public')
export class BotPublicController {
  private readonly logger = new Logger(BotPublicController.name);

  constructor(
    private readonly botService: BotService,
    @InjectRepository(Questionnaire)
    private questionnaireRepo: Repository<Questionnaire>,
    @InjectRepository(Answer)
    private answerRepo: Repository<Answer>,
  ) {}

  @Post('questionnaire')
  async startPoll(@Body() dto: CreateQuestionnaireRequestDto) {
    // 1️⃣ Speichern
    const questionnaire = await this.questionnaireRepo.save({
      question: dto.question,
      startTime: dto.startTime,
      endTime: dto.endTime,
      isLive: true,
    });

    const answers = dto.answers.map((a) =>
      this.answerRepo.create({ ...a, questionnaire }),
    );
    await this.answerRepo.save(answers);

    // 2️⃣ Discord-Bot starten
    await this.botService.sendPollToDiscord(dto);

    // 3️⃣ Automatisches Beenden
    this.scheduleVoteTracking(
      questionnaire.questionnaireID,
      new Date(dto.endTime),
    );

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
        this.logger.log(
          `Umfrage ${questionnaireID} wurde automatisch beendet.`,
        );
      }
    }, 60_000);
  }
}
