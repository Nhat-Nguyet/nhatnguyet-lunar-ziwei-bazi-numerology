// Drives the real grammY bot with fake updates. Outgoing API calls are caught
// by a transformer, so nothing goes to Telegram and no token is needed.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createBot } from "../src/bot.js";

function fakeBot(lang) {
  const sent = [];
  const bot = createBot("123456:TEST", {
    lang,
    botInfo: {
      id: 123456, is_bot: true, first_name: "Lich Am", username: "lich_am_test_bot",
      can_join_groups: true, can_read_all_group_messages: false, supports_inline_queries: false,
      can_connect_to_business: false, has_main_web_app: false,
    },
  });
  bot.api.config.use(async (_prev, method, payload) => {
    sent.push({ method, payload });
    return { ok: true, result: { message_id: sent.length, date: 0, chat: { id: 1, type: "private" }, text: payload.text } };
  });
  let id = 0;
  const say = async (text) => {
    const command = text.split(" ")[0];
    await bot.handleUpdate({
      update_id: ++id,
      message: {
        message_id: id, date: 0, chat: { id: 1, type: "private", first_name: "An" },
        from: { id: 1, is_bot: false, first_name: "An" }, text,
        entities: [{ type: "bot_command", offset: 0, length: command.length }],
      },
    });
    return sent.at(-1);
  };
  return { say, sent };
}

test("/today with a date", async () => {
  const { say } = fakeBot();
  const r = await say("/today 2027-02-06");
  assert.equal(r.method, "sendMessage");
  assert.equal(r.payload.chat_id, 1);
  assert.match(r.payload.text, /Lunar date: 1\/1\/2027/);
});

test("/hours with a date", async () => {
  const { say } = fakeBot();
  const r = await say("/hours 2027-02-06");
  assert.equal(r.method, "sendMessage");
  assert.match(r.payload.text, /^Auspicious hours of 2027-02-06/);
  assert.equal(r.payload.text.split("\n").length, 7);
});

test("/ziwei and /help, Vietnamese replies", async () => {
  const { say, sent } = fakeBot("vi");
  assert.match((await say("/ziwei 1990-09-19 20:00 male")).payload.text, /^# Lá số Tử Vi/);
  assert.match((await say("/help")).payload.text, /^Bot lịch âm Việt Nam/);
  assert.match((await say("/tet")).payload.text, /^(Tết|Hôm nay)/);
  assert.equal(sent.length, 3);
});
