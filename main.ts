import { NotificationService } from "./src/services/notification.service.ts";
import { TelegramProvider } from "./src/providers/telegram.provider.ts";

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");

const notificationService = new NotificationService();

if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
  notificationService.registerProvider(
    new TelegramProvider(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID)
  );
} else {
  console.warn("Telegram provider not configured (TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing)");
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);

  if (url.pathname === "/notify" && req.method === "POST") {
    try {
      const body = await req.json();
      const { message } = body;

      if (!message) {
        return new Response(JSON.stringify({ error: "Message is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      await notificationService.notifyAll(message);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return new Response("Not Found", { status: 404 });
});
