import express, { Request, Response } from "express";
import { bot } from "./bot";
import { TextChannel } from "discord.js";

const API_KEY = "37392788-5fa3-4aa3-aea9-608d7d1835e1";
const PORT = 3333;

const app = express();
app.use(express.json());

interface StartPollRequest {
  question: string;
  answers: { answer: string; number: number }[];
  channelId: string;
  endTime: string;
}

app.post("/start-poll", async (req: Request<any, any, StartPollRequest>, res: Response) => {
  const { question, answers, channelId, endTime } = req.body;
  const apiKey = req.headers["x-api-key"];

  if (apiKey !== API_KEY) {
    return res.status(401).json({ error: "Ungültiger API-Key" });
  }

  try {
    const channel = await bot.channels.fetch(channelId);
    if (!channel?.isTextBased()) {
      return res.status(400).json({ error: "Kein Textkanal gefunden" });
    }

    const messageText =
      `📊 **${question}**\n` +
      answers.map((a, i) => `🔘 ${String.fromCharCode(65 + i)}: ${a.answer}`).join("\n");

    const msg = await (channel as TextChannel).send(messageText);

    for (let i = 0; i < answers.length; i++) {
      await msg.react(["🇦", "🇧", "🇨", "🇩", "🇪"][i]);
    }

    res.json({ messageId: msg.id });
  } catch (err) {
    console.error("Fehler beim Senden der Umfrage:", err);
    res.status(500).json({ error: "Bot Fehler" });
  }
});

app.listen(PORT, () => console.log(`Bot HTTP-Server läuft auf Port ${PORT}`));
