import { Bot } from "grammy";
import { helpReply, hoursReply, tetReply, todayReply, ziweiReply } from "./replies.js";

export const COMMANDS = [
  { command: "today", description: "Lunar date, can chi, solar term" },
  { command: "hours", description: "Auspicious hours of a day" },
  { command: "tet", description: "Days until the Lunar New Year" },
  { command: "ziwei", description: "Zi Wei chart: /ziwei YYYY-MM-DD HH:MM male|female" },
  { command: "help", description: "What this bot does" },
];

/** A grammY bot with the five commands. `options` goes to `new Bot` (tests pass `botInfo`). */
export function createBot(token, { lang = "en", ...options } = {}) {
  const bot = new Bot(token, options);
  bot.command(["start", "help"], (ctx) => ctx.reply(helpReply({ lang })));
  bot.command("today", (ctx) => ctx.reply(todayReply(ctx.match, { lang })));
  bot.command("hours", (ctx) => ctx.reply(hoursReply(ctx.match, { lang })));
  bot.command("tet", (ctx) => ctx.reply(tetReply({ lang })));
  bot.command("ziwei", (ctx) => ctx.reply(ziweiReply(ctx.match, { lang })));
  bot.catch((err) => console.error("update failed:", err.error));
  return bot;
}
