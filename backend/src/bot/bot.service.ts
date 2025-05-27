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

let isPosting = false;
let isSyncingReactions = false;
let isEnding = false;

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
      if (message.content === '/Bist du da?') {
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
      messageId: null,
    });

    const answers = dto.answers.map((a) =>
      this.answerRepo.create({ ...a, questionnaire }),
    );
    await this.answerRepo.save(answers);

    this.logger.log(
      `Umfrage ${questionnaire.questionnaireID} gespeichert – wird später gepostet.`,
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
    if (isEnding) {
      this.logger.warn(
        'checkForEndedQuestionnaires läuft bereits – überspringe...',
      );
      return;
    }

    isEnding = true;
    this.logger.log('🔚 Cronjob gestartet: Überprüfe auf beendete Umfragen...');

    try {
      const now = new Date();
      this.logger.log(`Aktuelles Datum/Zeit (UTC): ${now.toISOString()}`);

      const liveVotes = await this.questionnaireRepo.find({
        where: { isLive: true },
      });

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
          this.logger.log(
            `Umfrage ${vote.questionnaireID} erfolgreich beendet.`,
          );
        } else {
          this.logger.warn(
            `Fehler beim Beenden von Umfrage ${vote.questionnaireID}: ${result.message}`,
          );
        }
      }
    } catch (err) {
      this.logger.error('Fehler in checkForEndedQuestionnaires():', err);
    } finally {
      isEnding = false;
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkForPostingQuestionnaire() {
    if (isPosting) {
      this.logger.warn(
        'checkForPostingQuestionnaire wird bereits ausgeführt – überspringe...',
      );
      return;
    }

    isPosting = true;
    this.logger.log('Cronjob gestartet: Überprüfe auf zu postende Umfragen...');
    const now = new Date();

    const pendingQuestionnaires = await this.questionnaireRepo.find({
      where: {
        isLive: true,
        wasPostedToDiscord: false,
        messageId: null,
        startTime: LessThanOrEqual(now),
      },
      relations: ['answers'],
    });

    this.logger.log(`Zu postende Umfragen: ${pendingQuestionnaires.length}`);

    for (const vote of pendingQuestionnaires) {
      try {
        const channel = await this.client.channels.fetch(vote.channelId);
        if (!channel || !channel.isTextBased()) {
          this.logger.warn(
            `Umfrage ${vote.questionnaireID} ohne gültige channelId übersprungen.`,
          );
          continue;
        }

        const endTimeFormatted = new Date(vote.endTime).toLocaleString(
          'de-DE',
          {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Europe/Berlin',
          },
        );

        const optionsText = vote.answers
          .map((a, i) => `${String.fromCodePoint(0x1f1e6 + i)} ${a.answer}`)
          .join('\n');

        const message = await (channel as TextChannel).send(
          `**${vote.question}**\n\n${optionsText}\n\nAbstimmung endet am **${endTimeFormatted}**`,
        );

        for (let i = 0; i < vote.answers.length; i++) {
          await message.react(String.fromCodePoint(0x1f1e6 + i));
        }

        // Speichere atomar
        vote.messageId = message.id;
        vote.wasPostedToDiscord = true;
        await this.questionnaireRepo.update(vote.questionnaireID, {
          messageId: vote.messageId,
          wasPostedToDiscord: true,
        });

        this.logger.log(
          `Umfrage ${vote.questionnaireID} wurde gepostet und gespeichert.`,
        );
      } catch (err) {
        this.logger.error(
          `Fehler beim Posten der Umfrage ${vote.questionnaireID}: ${err.message}`,
        );
      }
    }
    isPosting = false;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async syncReactionsWithDatabase() {
    if (isSyncingReactions) {
      this.logger.warn(
        'Reaktionen werden bereits synchronisiert – überspringe...',
      );
      return;
    }

    isSyncingReactions = true;
    this.logger.log(
      'Cronjob: Synchronisiere Reaktionsanzahl mit der Datenbank...',
    );

    try {
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

            if (answer.lastSyncedCount == null) {
              answer.lastSyncedCount = 0;
            }

            const delta = currentCount - answer.lastSyncedCount;

            if (delta <= 0) {
              this.logger.log(
                `Keine neuen Stimmen für "${answer.answer}" (aktuell: ${currentCount}, bereits gespeichert: ${answer.lastSyncedCount})`,
              );
              continue;
            }

            for (let j = 0; j < delta; j++) {
              await this.votingRepo.save({ questionnaire, answer });
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
    } catch (err) {
      this.logger.error('Fehler in syncReactionsWithDatabase():', err);
    } finally {
      isSyncingReactions = false;
    }
  }

  async handleQuestionnaireEnd(dto: MarkQuestionnaireEndedRequestDto) {
    const { questionnaireID } = dto;

    this.logger.log(`🔚 handleVoteEnd für QuestionnaireID: ${questionnaireID}`);

    const questionnaire = await this.questionnaireRepo.findOne({
      where: { questionnaireID },
    });

    if (!questionnaire) {
      this.logger.warn(`Umfrage ${questionnaireID} nicht gefunden.`);
      return { success: false, message: 'Questionnaire not found' };
    }

    if (!questionnaire.isLive) {
      this.logger.warn(`Umfrage ${questionnaireID} ist bereits beendet.`);
      return { success: false, message: 'Questionnaire already ended' };
    }

    await this.syncReactionsForQuestionnaire(questionnaire);

    await this.questionnaireRepo.update(
        { questionnaireID },
        { isLive: false }
    );
    this.logger.log(`Umfrage ${questionnaireID} wurde korrekt beendet und deaktiviert.`);

    try {
      const channel = await this.client.channels.fetch(questionnaire.channelId);
      if (channel && channel.isTextBased()) {
        await (channel as TextChannel).send(
          `Die Umfrage **${questionnaire.question}** ist nun beendet. Vielen Dank fürs Mitmachen!`,
        );
        this.logger.log(`Abschlussnachricht für ${questionnaireID} gesendet.`);
      } else {
        this.logger.warn(
          `Channel ${questionnaire.channelId} ist ungültig oder nicht textbasiert.`,
        );
      }
    } catch (err) {
      this.logger.error(
        `Fehler beim Senden der Abschlussnachricht für Umfrage ${questionnaireID}:`,
        err,
      );
    }

    return { success: true };
  }

  async getAllQuestionnaires(): Promise<GetAllQuestionnairesResponseDto[]> {
    const questionnaires = await this.questionnaireRepo.find({
      relations: ['answers', 'answers.votings'],
    });

    questionnaires.sort(
      (a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime(),
    );

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

  private async syncReactionsForQuestionnaire(questionnaire: Questionnaire) {
    if (!questionnaire.messageId || !questionnaire.channelId) {
      this.logger.warn(`Umfrage ${questionnaire.questionnaireID} hat keine messageId oder channelId`);
      return;
    }

    const channel = await this.client.channels.fetch(questionnaire.channelId);
    if (!channel?.isTextBased()) return;

    const message = await (channel as TextChannel).messages.fetch(questionnaire.messageId);
    const reactions = message.reactions.cache;

    const answers = (await this.answerRepo.find({
      where: { questionnaire: { questionnaireID: questionnaire.questionnaireID } },
      relations: ['questionnaire'],
    })).sort((a, b) => a.answerID - b.answerID);

    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];
      const emoji = String.fromCodePoint(0x1f1e6 + i);
      const reaction = reactions.get(emoji);
      const currentCount = reaction?.count ?? 0;

      const lastSynced = answer.lastSyncedCount ?? 0;
      const delta = currentCount - lastSynced;

      this.logger.log(`${delta} neue Stimme(n) für "${answer.answer}" gespeichert (gesamt: ${currentCount}).`);

      if (delta <= 0) continue;

      for (let j = 0; j < delta; j++) {
        await this.votingRepo.save({
          questionnaire: { questionnaireID: questionnaire.questionnaireID },
          answer: { answerID: answer.answerID },
        });
      }

      answer.lastSyncedCount = currentCount;
      await this.answerRepo.save(answer);
    }
  }

}
