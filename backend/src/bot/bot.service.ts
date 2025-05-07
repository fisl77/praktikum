import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
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
import { Voting } from '../Voting/voting.entity';

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
    //Speichern in Datenbank
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

    //Umfrage auf Discord senden
    const channelId: string = dto.channelId;
    const channel: Channel = await this.client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) {
      this.logger.error(
        `Channel ${channelId} nicht gefunden oder kein Textkanal.`,
      );
      return;
    }

    const question: string = dto.question;
    const optionsText: string = dto.answers
      .map((a, i) => `${String.fromCodePoint(0x1f1e6 + i)} ${a.answer}`)
      .join('\n');

    const message = await (channel as TextChannel).send(
      `**${question}**\n\n${optionsText}`,
    );
    for (let i = 0; i < dto.answers.length; i++) {
      await message.react(String.fromCodePoint(0x1f1e6 + i));
    }

    // 5. messageId in der DB speichern (NEU!)
    questionnaire.messageId = message.id;
    await this.questionnaireRepo.save(questionnaire); // <- Update mit messageId

    this.logger.log(`Umfrage gesendet an Channel ${channelId}`);

    //Automatisch beenden
    this.scheduleVoteTracking(
      questionnaire.questionnaireID,
      new Date(dto.endTime),
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

  //cronjob anwenden!
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
