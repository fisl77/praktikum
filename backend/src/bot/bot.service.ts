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
      if (message.content === '/Bist du da?' || message.content === '/Are you there?') {
        message.reply('I am always here :)');
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
        'Start time must not be in the past.',
      );
    }

    if (end <= start) {
      throw new BadRequestException('End time must be after the start time.');
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
      `Questionnaire ${questionnaire.questionnaireID} saved – will be posted later.`,
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
        'checkForEndedQuestionnaires is already running – skipping...',
      );
      return;
    }

    isEnding = true;
    this.logger.log('🔚 Cronjob started: checking for ended questionnaires...');

    try {
      const now = new Date();
      this.logger.log(`Current date/time (UTC): ${now.toISOString()}`);

      const liveVotes = await this.questionnaireRepo.find({
        where: { isLive: true },
      });

      const expiredVotes = liveVotes.filter((vote) => {
        const endTime = new Date(vote.endTime);
        const isExpired = endTime.getTime() <= now.getTime();

        this.logger.log(
          `Questionnaire ${vote.questionnaireID}: endTime=${endTime.toISOString()}, now=${now.toISOString()}, stopped=${isExpired}`,
        );

        return isExpired;
      });

      this.logger.log(
        `A total of ${expiredVotes.length} questionnaires have expired and will be ended...`,
      );

      for (const vote of expiredVotes) {
        this.logger.log(`Ending questionnaire ${vote.questionnaireID}...`);

        const result = await this.handleQuestionnaireEnd({
          questionnaireID: vote.questionnaireID,
        });

        if (result.success) {
          this.logger.log(
            `Questionnaire ${vote.questionnaireID} ended successfully.`,
          );
        } else {
          this.logger.warn(
            `Error while ending questionnaire ${vote.questionnaireID}: ${result.message}`,
          );
        }
      }
    } catch (err) {
      this.logger.error('Error in checkForEndedQuestionnaires():', err);
    } finally {
      isEnding = false;
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkForPostingQuestionnaire() {
    if (isPosting) {
      this.logger.warn(
        'checkForPostingQuestionnaire is already running – skipping...',
      );
      return;
    }

    isPosting = true;
    this.logger.log('Cronjob started: Checking for questionnaires to post...');
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

    this.logger.log(`Questionnaire to be posted: ${pendingQuestionnaires.length}`);

    for (const vote of pendingQuestionnaires) {
      try {
        const channel = await this.client.channels.fetch(vote.channelId);
        if (!channel || !channel.isTextBased()) {
          this.logger.warn(
            `Questionnaire ${vote.questionnaireID} skipped due to unvalid channelId.`,
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
          `**${vote.question}**\n\n${optionsText}\n\nQuestionnaire ends at **${endTimeFormatted}**`,
        );

        for (let i = 0; i < vote.answers.length; i++) {
          await message.react(String.fromCodePoint(0x1f1e6 + i));
        }

        vote.messageId = message.id;
        vote.wasPostedToDiscord = true;
        await this.questionnaireRepo.update(vote.questionnaireID, {
          messageId: vote.messageId,
          wasPostedToDiscord: true,
        });

        this.logger.log(
          `Questionnaire ${vote.questionnaireID} was posted and saved.`,
        );
      } catch (err) {
        this.logger.error(
          `Error posting questionnaire ${vote.questionnaireID}: ${err.message}`,
        );
      }
    }
    isPosting = false;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async syncReactionsWithDatabase() {
    if (isSyncingReactions) {
      this.logger.warn(
        'Reactions are already being synchronized – skipping...',
      );
      return;
    }

    isSyncingReactions = true;
    this.logger.log(
      'Cron job: Synchronizing reaction count with database...',
    );

    try {
      const liveQuestionnaires = await this.questionnaireRepo.find({
        where: { isLive: true },
        relations: ['answers'],
      });
      for (const questionnaire of liveQuestionnaires) {
        if (!questionnaire.messageId || !questionnaire.channelId) {
          this.logger.warn(
            `Questionnaire ${questionnaire.questionnaireID} skipped due to missing messageId or channelId.`,
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
                `No new votes for "${answer.answer}" (current: ${currentCount}, already saved: ${answer.lastSyncedCount})`,
              );
              continue;
            }

            for (let j = 0; j < delta; j++) {
              await this.votingRepo.save({ questionnaire, answer });
            }

            answer.lastSyncedCount = currentCount;
            await this.answerRepo.save(answer);

            this.logger.log(
              `${delta} new vote(s) for "${answer.answer}" saved (total: ${currentCount}).`,
            );
          }
        } catch (err) {
          this.logger.error(
            `Error synchronizing questionnaire ${questionnaire.questionnaireID}: ${err.message}`,
          );
        }
      }
    } catch (err) {
      this.logger.error('Error in syncReactionsWithDatabase():', err);
    } finally {
      isSyncingReactions = false;
    }
  }

  async handleQuestionnaireEnd(dto: MarkQuestionnaireEndedRequestDto) {
    const { questionnaireID } = dto;

    this.logger.log(`🔚 handleVoteEnd for QuestionnaireID: ${questionnaireID}`);

    const questionnaire = await this.questionnaireRepo.findOne({
      where: { questionnaireID },
    });

    if (!questionnaire) {
      this.logger.warn(`Questionnaire ${questionnaireID} not found.`);
      return { success: false, message: 'Questionnaire not found' };
    }

    if (!questionnaire.isLive) {
      this.logger.warn(`Questionnaire ${questionnaireID} already ended.`);
      return { success: false, message: 'Questionnaire already ended' };
    }

    await this.syncReactionsWithDatabase();

    await this.questionnaireRepo.update(
      { questionnaireID },
      {
        isLive: false,
        endTime: new Date(),
      },
    );
    this.logger.log(
      `Questionnaire ${questionnaireID} was properly ended and deactivated.`,
    );

    try {
      const channel = await this.client.channels.fetch(questionnaire.channelId);
      if (channel && channel.isTextBased()) {
        await (channel as TextChannel).send(
          `The questionnaire **${questionnaire.question}** has now ended. Thank you for participating!`,
        );
        this.logger.log(`Final message sent for ${questionnaireID}.`);
      } else {
        this.logger.warn(
          `Channel ${questionnaire.channelId} is invalid.`,
        );
      }
    } catch (err) {
      this.logger.error(
        `Error while sending final message for questionnaire ${questionnaireID}:`,
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
}
