// Run: BOT_TOKEN=123:abc npm start   (token from @BotFather)
import { COMMANDS, createBot } from "./bot.js";

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("Set BOT_TOKEN to the token @BotFather gave you, e.g. BOT_TOKEN=123:abc npm start");
  process.exit(1);
}

const bot = createBot(token, { lang: process.env.BOT_LANG || "en" });
await bot.api.setMyCommands(COMMANDS);
process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());
console.log("Bot running (long polling). Ctrl+C to stop.");
await bot.start();
