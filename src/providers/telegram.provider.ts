import { NotificationProvider } from "../services/notification.service.js";

export class TelegramProvider implements NotificationProvider {
  readonly name = "telegram";
  private readonly botToken: string;
  private readonly chatId: string;

  constructor(botToken: string, chatId: string) {
    this.botToken = botToken;
    this.chatId = chatId;
  }

  async send(message: string): Promise<void> {
    if (!this.botToken || !this.chatId) {
      throw new Error("Telegram Bot Token or Chat ID not configured");
    }

    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: this.chatId,
        text: message,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Telegram API error: ${response.status} - ${error}`);
    }
  }
}
