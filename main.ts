import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { NotificationService } from "./src/services/notification.service.js";
import { TelegramProvider } from "./src/providers/telegram.provider.js";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const notificationService = new NotificationService();

if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
  notificationService.registerProvider(
    new TelegramProvider(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID)
  );
} else {
  console.warn("Telegram provider not configured (TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing)");
}

const app = new Hono();

app.post("/notify", async (c) => {
  try {
    const body = await c.req.json();
    const { message } = body;

    if (!message) {
      return c.json({ error: "Message is required" }, 400);
    }

    await notificationService.notifyAll(message);

    return c.json({ success: true });
  } catch (err) {
    return c.json({ error: "Invalid JSON" }, 400);
  }
});

app.all("*", (c) => {
  return c.text("Not Found", 404);
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
