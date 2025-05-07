import {
  Injectable,
  Logger,
  OnModuleInit,
  BadRequestException,
} from '@nestjs/common';
import {
  Channel,
  Client,
  GatewayIntentBits,
  Partials,
  TextChannel,
} from 'discord.js';
import { ConfigService } from '@nestjs/config';
import { Repository, LessThanOrEqual } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateQuestionnaireRequestDto } from '../Questionnaire/dto/CreateQuestionnaireRequestDto';
import { Questionnaire } from '../Questionnaire/questionnaire.entity';
import { Answer } from '../Answer/answer.entity';
import { Voting } from '../Voting/voting.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { MarkVoteEndedRequestDto } from '../Questionnaire/dto/MarkVoteEndedRequestDto';

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

    this.client.on('messageReactionAdd', async (reaction, user) => {
      try {
        this.logger.log(`Reaktion empfangen: ${reaction.emoji.name}`);

        if (user?.bot) return;

        if (reaction.partial) await reaction.fetch();
        if (reaction.message.partial) await reaction.message.fetch();

        const messageId = reaction.message.id;
        this.logger.log(`Message ID: ${messageId}`);

        const questionnaire = await this.questionnaireRepo.findOne({
          where: { isLive: true, messageId },
          relations: ['answers'],
        });

        if (!questionnaire) {
          this.logger.warn(`Keine Umfrage gefunden für messageId ${messageId}`);
          return;
        }

        const emojiIndex = reaction.emoji.name.codePointAt(0)! - 0x1f1e6;
        const answer = questionnaire.answers[emojiIndex];

        if (!answer) {
          this.logger.warn(`Keine Antwort bei emojiIndex ${emojiIndex}`);
          return;
        }

        const vote = this.votingRepo.create({
          questionnaireID: questionnaire.questionnaireID,
          answerID: answer.answerID,
          questionnaire,
          answer,
        });

        await this.votingRepo.save(vote);

        this.logger.log(
          `Vote gespeichert: Fragebogen ${questionnaire.questionnaireID}, Antwort ${answer.answer}`,
        );
      } catch (err) {
        this.logger.error('Fehler beim Verarbeiten der Reaktion:', err);
      }
    });

    const token = this.configService.get<string>('BOT_TOKEN');
    if (!token) {
      this.logger.error('BOT_TOKEN is not defined in .env');
      return;
    }

    await this.client.login(token);
  }

  async startAndTrackVote(dto: CreateQuestionnaireRequestDto) {
    const now = new Date();
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    if (start < now) {
      throw new BadRequestException(
        '❌ Startzeit darf nicht in der Vergangenheit liegen.',
      );
    }

    if (end <= start) {
      throw new BadRequestException(
        '❌ Endzeit muss nach der Startzeit liegen.',
      );
    }

    const questionnaire = await this.questionnaireRepo.save({
      question: dto.question,
      startTime: dto.startTime,
      endTime: dto.endTime,
      isLive: true,
      channelId: dto.channelId,
    });

    const answers = dto.answers.map((a) =>
      this.answerRepo.create({ ...a, questionnaire }),
    );
    await this.answerRepo.save(answers);

    const channelId: string = dto.channelId;
    const channel: Channel = await this.client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) {
      this.logger.error(
        `Channel ${channelId} nicht gefunden oder kein Textkanal.`,
      );
      return;
    }

    const endDate = new Date(dto.endTime);
    const endTimeFormatted = endDate.toLocaleString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Berlin',
    });

    const question = dto.question;
    const optionsText = dto.answers
      .map((a, i) => `${String.fromCodePoint(0x1f1e6 + i)} ${a.answer}`)
      .join('\n');

    const message = await (channel as TextChannel).send(
      `**${question}**\n\n${optionsText}\n\n⏰ Abstimmung endet am **${endTimeFormatted}**`,
    );

    for (let i = 0; i < dto.answers.length; i++) {
      await message.react(String.fromCodePoint(0x1f1e6 + i));
    }

      // 5. messageId in der DB speichern (NEU!)
      questionnaire.messageId = message.id;
      await this.questionnaireRepo.save(questionnaire);

    this.logger.log(`Umfrage gesendet an Channel ${channelId}`);

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
  async checkForEndedVotes() {
    this.logger.log('🕐 Cronjob: Überprüfe auf beendete Umfragen...');
    const now = new Date();
    const expiredVotes = await this.questionnaireRepo.find({
      where: {
        isLive: true,
        endTime: LessThanOrEqual(now),
      },
    });

    for (const vote of expiredVotes) {
      this.logger.log(`🔍 Beende Umfrage ${vote.questionnaireID}...`);

      await this.questionnaireRepo.update(
        { questionnaireID: vote.questionnaireID },
        { isLive: false },
      );

      try {
        const url = `${this.configService.get<string>('BACKEND_URL')}/public/vote-end`;
        await lastValueFrom(
          this.httpService.post(url, {
            questionnaireID: vote.questionnaireID,
          }),
        );
        this.logger.log(
          `✅ Abschlussmeldung für ${vote.questionnaireID} gesendet.`,
        );
      } catch (err) {
        this.logger.error(
          `❌ Fehler beim POST an /public/vote-end für ${vote.questionnaireID}:`,
          err,
        );
      }

      this.logger.log(
        `🔚 Umfrage ${vote.questionnaireID} automatisch beendet.`,
      );
    }
  }

  async handleVoteEnd(dto: MarkVoteEndedRequestDto) {
    const { questionnaireID } = dto;

    const questionnaire = await this.questionnaireRepo.findOne({
      where: { questionnaireID },
    });

    if (!questionnaire) {
      this.logger.warn(`⚠️ Umfrage ${questionnaireID} nicht gefunden.`);
      return { success: false, message: 'Questionnaire not found' };
    }

    await this.questionnaireRepo.update({ questionnaireID }, { isLive: false });

    const channel = await this.client.channels.fetch(questionnaire.channelId);
    if (channel && channel.isTextBased()) {
      await (channel as TextChannel).send(
        `❗️ Die Umfrage **${questionnaire.question}** ist nun beendet. Vielen Dank fürs Mitmachen!`,
      );
    }

    this.logger.log(`📴 Umfrage ${questionnaireID} wurde manuell beendet.`);
    return { success: true };
  }
}
