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
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateQuestionnaireRequestDto } from '../Questionnaire/dto/CreateQuestionnaireRequestDto';
import { Questionnaire } from '../Questionnaire/questionnaire.entity';
import { Answer } from '../Answer/answer.entity';
import { SchedulerRegistry } from '@nestjs/schedule';
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
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly httpService: HttpService,
  ) {}

  async onModuleInit() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
      partials: [Partials.Channel],
    });

    this.client.once('ready', () => {
      this.logger.log(`✅ Bot logged in as ${this.client.user?.tag}`);
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

    const endTimeFormatted = new Date(dto.endTime).toLocaleString('de-DE', {
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
      `**${question}**\n\n${optionsText}\n\n⏰ Abstimmung endet am **${endTimeFormatted} Uhr**`,
    );

    for (let i = 0; i < dto.answers.length; i++) {
      await message.react(String.fromCodePoint(0x1f1e6 + i));
    }

    this.logger.log(`Umfrage gesendet an Channel ${channelId}`);
    this.scheduleVoteClosing(
      questionnaire.questionnaireID,
      new Date(dto.endTime),
    );

    return {
      success: true,
      id: questionnaire.questionnaireID,
    };
  }

  private scheduleVoteClosing(questionnaireID: number, endTime: Date) {
    const jobName = `close-poll-${questionnaireID}`;
    const delay = endTime.getTime() - Date.now();

    const timeout = setTimeout(async () => {
      await this.questionnaireRepo.update(
        { questionnaireID },
        { isLive: false },
      );

      try {
        const url = `${this.configService.get<string>('BACKEND_URL')}/public/vote-end`;
        await lastValueFrom(this.httpService.post(url, { questionnaireID }));
        this.logger.log(`✅ Abschlussmeldung für ${questionnaireID} gesendet.`);
      } catch (err) {
        this.logger.error('❌ Fehler beim POST an /public/vote-end:', err);
      }

      this.schedulerRegistry.deleteTimeout(jobName);
      this.logger.log(`🔚 Umfrage ${questionnaireID} automatisch beendet.`);
    }, delay);

    this.schedulerRegistry.addTimeout(jobName, timeout);
  }

  async handleVoteEnd(dto: MarkVoteEndedRequestDto) {
    const { questionnaireID } = dto;

    const questionnaire = await this.questionnaireRepo.findOne({
      where: { questionnaireID },
    });

    if (!questionnaire) {
      this.logger.warn(`Umfrage ${questionnaireID} nicht gefunden.`);
      return { success: false, message: 'Questionnaire not found' };
    }

    await this.questionnaireRepo.update({ questionnaireID }, { isLive: false });

    const channel = await this.client.channels.fetch(questionnaire.channelId);
    if (channel && channel.isTextBased()) {
      await (channel as TextChannel).send(
        `❗️ Die Umfrage **${questionnaire.question}** ist nun beendet. Vielen Dank fürs Mitmachen!`,
      );
    }

    this.logger.log(`Umfrage ${questionnaireID} wurde manuell beendet.`);
    return { success: true };
  }
}
