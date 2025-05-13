import {
  Injectable,
  Logger,
  OnModuleInit,
  BadRequestException,
} from '@nestjs/common';
import { Client, GatewayIntentBits, Partials, TextChannel } from 'discord.js';
import { ConfigService } from '@nestjs/config';
import { Repository, LessThanOrEqual } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateQuestionnaireRequestDto } from '../Questionnaire/dto/CreateQuestionnaireRequestDto';
import { Questionnaire } from '../Questionnaire/questionnaire.entity';
import { Answer } from '../Answer/answer.entity';
import { Voting } from '../Voting/voting.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { MarkQuestionnaireEndedRequestDto } from '../Questionnaire/dto/MarkQuestionnaireEndedRequestDto';
import { GetAllQuestionnairesResponseDto } from '../Questionnaire/dto/get-all-questionnaires-response';

@Injectable()
export class BotService implements OnModuleInit {
  private readonly logger = new Logger(BotService.name);
  private client: Client;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Questionnaire)
    private questionnaireRepo: Repository<Questionnaire>,
    @InjectRepository(Answer)
    private answerRepo: Repository<Answer>,
    private readonly httpService: HttpService,
    @InjectRepository(Voting)
    private votingRepo: Repository<Voting>,
  ) {}

  async onModuleInit() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
      ],
      partials: [Partials.Channel, Partials.User],
    });

    this.client.once('ready', () => {
      this.logger.log(`Bot logged in as ${this.client.user?.tag}`);
    });

    this.client.on('messageCreate', (message) => {
      if (message.content === '!Bist du da?') {
        message.reply('Ich bin immer da :)');
      }
    });

    const token = this.configService.get<string>('BOT_TOKEN');
    if (!token) {
      this.logger.error('BOT_TOKEN is not defined in .env');
      return;
    }

    await this.client.login(token);
  }

  async startAndTrackQuestionnaire(dto: CreateQuestionnaireRequestDto) {
    const now = new Date();
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    if (start < now) {
      throw new BadRequestException(
        'Startzeit darf nicht in der Vergangenheit liegen.',
      );
    }

    if (end <= start) {
      throw new BadRequestException('Endzeit muss nach der Startzeit liegen.');
    }

    const questionnaire = await this.questionnaireRepo.save({
      question: dto.question,
      startTime: dto.startTime,
      endTime: dto.endTime,
      isLive: true,
      channelId: dto.channelId,
      wasPostedToDiscord: false,
    });

    const answers = dto.answers.map((a) =>
      this.answerRepo.create({ ...a, questionnaire }),
    );
    await this.answerRepo.save(answers);

    this.logger.log(
      `Umfrage ${questionnaire.questionnaireID} in DB gespeichert, aber noch nicht gepostet.`,
    );

    return {
      success: true,
      id: questionnaire.questionnaireID,
    };
  }

  async getResults(questionnaireID: number) {
    const votes = await this.votingRepo.find({
      where: { questionnaireID },
      relations: ['answer'],
    });

    const resultMap = new Map<string, number>();
    for (const vote of votes) {
      const label = vote.answer.answer;
      resultMap.set(label, (resultMap.get(label) || 0) + 1);
    }

    return Array.from(resultMap.entries()).map(([answer, count]) => ({
      answer,
      count,
    }));
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkForEndedQuestionnaires() {
    this.logger.log('Cronjob gestartet: Überprüfe auf beendete Umfragen...');

    const now = new Date();
    this.logger.log(`Aktuelles Datum/Zeit (UTC): ${now.toISOString()}`);

    // Hole alle Umfragen, die noch live sind
    const liveVotes = await this.questionnaireRepo.find({
      where: { isLive: true },
    });

    // Finde alle, deren Endzeit abgelaufen ist
    const expiredVotes = liveVotes.filter((vote) => {
      const endTime = new Date(vote.endTime);
      const isExpired = endTime.getTime() <= now.getTime();

      this.logger.log(
        `Umfrage ${vote.questionnaireID}: endTime=${endTime.toISOString()}, now=${now.toISOString()}, abgelaufen=${isExpired}`,
      );

      return isExpired;
    });

    this.logger.log(
      `Insgesamt ${expiredVotes.length} Umfragen sind abgelaufen und werden beendet...`,
    );

    for (const vote of expiredVotes) {
      this.logger.log(`Beende Umfrage ${vote.questionnaireID}...`);

      const result = await this.handleQuestionnaireEnd({
        questionnaireID: vote.questionnaireID,
      });

      if (result.success) {
        this.logger.log(`Umfrage ${vote.questionnaireID} erfolgreich beendet.`);
      } else {
        this.logger.warn(
          `Fehler beim Beenden von Umfrage ${vote.questionnaireID}: ${result.message}`,
        );
      }
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkForPostingVotes() {
    this.logger.log('Cronjob gestartet: Überprüfe auf zu postende Umfragen...');
    const now = new Date();

    const pendingVotes = await this.questionnaireRepo.find({
      where: {
        isLive: true,
        wasPostedToDiscord: false,
        startTime: LessThanOrEqual(now),
      },
      relations: ['answers'],
    });

    this.logger.log(`Gefundene Umfragen zum Posten: ${pendingVotes.length}`);

    for (const vote of pendingVotes) {
      const channel = await this.client.channels.fetch(vote.channelId);
      if (!channel || !channel.isTextBased()) {
        this.logger.warn(`📭 Channel ${vote.channelId} ungültig.`);
        continue;
      }

      const endTimeFormatted = new Date(vote.endTime).toLocaleString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Berlin',
      });

      const optionsText = vote.answers
        .map((a, i) => `${String.fromCodePoint(0x1f1e6 + i)} ${a.answer}`)
        .join('\n');

      const message = await (channel as TextChannel).send(
        `**${vote.question}**\n\n${optionsText}\n\n⏰ Abstimmung endet am **${endTimeFormatted}**`,
      );

      for (let i = 0; i < vote.answers.length; i++) {
        await message.react(String.fromCodePoint(0x1f1e6 + i));
      }

      vote.messageId = message.id;
      vote.wasPostedToDiscord = true;
      await this.questionnaireRepo.save(vote);

      this.logger.log(`Umfrage ${vote.questionnaireID} wurde jetzt gepostet.`);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async syncReactionsWithDatabase() {
    this.logger.log(
      'Cronjob: Synchronisiere Reaktionsanzahl mit der Datenbank...',
    );

    const liveQuestionnaires = await this.questionnaireRepo.find({
      where: { isLive: true },
      relations: ['answers'],
    });

    for (const questionnaire of liveQuestionnaires) {
      if (!questionnaire.messageId || !questionnaire.channelId) {
        this.logger.warn(
          `Umfrage ${questionnaire.questionnaireID} ohne gültige messageId oder channelId übersprungen.`,
        );
        continue;
      }

      try {
        const channel = await this.client.channels.fetch(
          questionnaire.channelId,
        );
        if (!channel || !channel.isTextBased()) continue;

        const message = await (channel as TextChannel).messages.fetch(
          questionnaire.messageId,
        );
        const reactions = message.reactions.cache;

        for (let i = 0; i < questionnaire.answers.length; i++) {
          const answer = questionnaire.answers[i];
          const emoji = String.fromCodePoint(0x1f1e6 + i);

          const reaction = reactions.get(emoji);
          const currentCount = reaction?.count ?? 0;

          const lastSynced = answer.lastSyncedCount ?? 0;
          const delta = currentCount - lastSynced;

          if (delta <= 0) continue;

          for (let j = 0; j < delta; j++) {
            await this.votingRepo.save({
              questionnaire,
              answer,
            });
          }

          answer.lastSyncedCount = currentCount;
          await this.answerRepo.save(answer);

          this.logger.log(
            `${delta} neue Stimme(n) für "${answer.answer}" gespeichert (gesamt: ${currentCount}).`,
          );
        }
      } catch (err) {
        this.logger.error(
          `Fehler beim Synchronisieren von Umfrage ${questionnaire.questionnaireID}: ${err.message}`,
        );
      }
    }
  }

  async handleQuestionnaireEnd(dto: MarkQuestionnaireEndedRequestDto) {
    const { questionnaireID } = dto;

    this.logger.log(
      `handleVoteEnd aufgerufen für QuestionnaireID: ${questionnaireID}`,
    );

    const questionnaire = await this.questionnaireRepo.findOne({
      where: { questionnaireID },
    });

    if (!questionnaire) {
      this.logger.warn(`Umfrage ${questionnaireID} nicht gefunden.`);
      return { success: false, message: 'Questionnaire not found' };
    }

    this.logger.log(
      `handleVoteEnd gestartet – ID: ${questionnaireID}, channelId: ${questionnaire.channelId}`,
    );

    await this.questionnaireRepo.update({ questionnaireID }, { isLive: false });
    this.logger.log(
      `Fragebogen ${questionnaireID} in DB auf isLive = false gesetzt.`,
    );

    try {
      const channel = await this.client.channels.fetch(questionnaire.channelId);
      if (channel && channel.isTextBased()) {
        await (channel as TextChannel).send(
          `Die Umfrage **${questionnaire.question}** ist nun beendet. Vielen Dank fürs Mitmachen!`,
        );
        this.logger.log(
          `Benachrichtigung im Channel ${questionnaire.channelId} gesendet.`,
        );
      } else {
        this.logger.warn(
          `Channel ${questionnaire.channelId} ist nicht textbasiert oder nicht gefunden.`,
        );
      }
    } catch (err) {
      this.logger.error(
        `Fehler beim Senden der Discord-Nachricht für ${questionnaireID}:`,
        err,
      );
    }

    this.logger.log(`Umfrage ${questionnaireID} wurde manuell beendet.`);
    return { success: true };
  }

  async getAllQuestionnaires(): Promise<GetAllQuestionnairesResponseDto[]> {
    const questionnaires = await this.questionnaireRepo.find({
      relations: ['answers', 'answers.votings'],
    });

    return questionnaires.map((q) => ({
      questionnaireID: q.questionnaireID,
      question: q.question,
      startTime: q.startTime,
      endTime: q.endTime,
      isLive: q.isLive,
      wasPostedToDiscord: q.wasPostedToDiscord,
      answers: q.answers.map((a) => ({
        answerID: a.answerID,
        answer: a.answer,
        totalVotes: a.votings.length,
      })),
    }));
  }
}
