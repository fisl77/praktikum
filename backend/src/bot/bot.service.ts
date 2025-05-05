import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Client, GatewayIntentBits, Partials, TextChannel } from 'discord.js';
import { ConfigService } from '@nestjs/config';
import { CreateQuestionnaireRequestDto } from '../Questionnaire/dto/CreateQuestionnaireRequestDto';

@Injectable()
export class BotService implements OnModuleInit {
  private readonly logger = new Logger(BotService.name);
  private client: Client;

  constructor(private readonly configService: ConfigService) {}

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
      if (message.content === '!ping') {
        message.reply('Pong!');
      }
    });

    const token = this.configService.get<string>('BOT_TOKEN');
    if (!token) {
      this.logger.error('❌ BOT_TOKEN is not defined in .env');
      return;
    }

    await this.client.login(token);
  }

  async sendPollToDiscord(dto: CreateQuestionnaireRequestDto) {
    const channelId = dto.channelId;
    const channel = await this.client.channels.fetch(channelId);

    if (!channel || !channel.isTextBased()) {
      this.logger.error(
        ` Konnte Channel ${channelId} nicht finden oder Channel ist kein Textkanal.`,
      );
      return;
    }

    const question = dto.question;
    const optionsText = dto.answers
      .map((a, i) => `${String.fromCodePoint(0x1f1e6 + i)} ${a.answer}`)
      .join('\n');

    const message = await (channel as TextChannel).send(
      ` **${question}**\n\n${optionsText}`,
    );

    for (let i = 0; i < dto.answers.length; i++) {
      await message.react(String.fromCodePoint(0x1f1e6 + i)); // Reactions: 🇦 🇧 🇨 ...
    }

    this.logger.log(` Umfrage gesendet an Channel ${channelId}`);
  }
}
