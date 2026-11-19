# Vietnamese lunar calendar bot for Telegram

A small [grammY](https://grammy.dev) bot built on the Nhat Nguyet libraries.

| Command | Reply |
|---|---|
| `/today [YYYY-MM-DD]` | lunar date, sexagenary day, month and year (Vietnamese: can chi), solar term and the next one |
| `/tet` | days until the next Lunar New Year |
| `/ziwei YYYY-MM-DD HH:MM male\|female` | a Zi Wei Dou Shu chart as text (`chartToText`, summary) |
| `/hours [YYYY-MM-DD]` | the six auspicious hours of the day (Vietnam time) |
| `/help` | the list above |

"Today" is the date in Vietnam (UTC+7), whatever the time zone of the server.

```text
/today 2027-02-06

2027-02-06
Lunar date: 1/1/2027
Day Bing Chen · Month Ren Yin · Year Ding Wei (Goat)
Solar term: Start of Spring (next: Rain Water, 2027-02-19)
```

## Run it (about 2 minutes)

1. In Telegram, talk to [@BotFather](https://t.me/BotFather), send `/newbot` and copy the token.
2. Inside this repository the example uses the local packages, so build them once:

   ```bash
   cd ../../js && npm install && npm run build && cd -   # local packages, once
   npm install
   BOT_TOKEN=123456:your-token npm start
   ```

3. Send `/today` to your bot.

`BOT_LANG=vi` (or `zh`) switches the replies to Vietnamese (or Chinese). Keep
the token out of git: put it in your shell, your host's secret settings, or a
`.env` file (ignored by `.gitignore`; see `.env.example`), never in the code.
The bot uses long polling, so it runs on any machine with outgoing internet
access; no public URL or webhook is needed.

## Tests

```bash
npm test
```

`test/replies.test.js` checks the text of every reply; `test/bot.test.js`
drives the real grammY bot with fake Telegram updates and catches the outgoing
API calls, so the tests need no token and no network.

## In your own project

From version 0.3.0 the packages are on npm under English names. Replace the
`file:` dependencies in `package.json` with:

```json
"@nhatnguyet/lunar": "^0.3.0",
"@nhatnguyet/ziwei": "^0.3.0"
```

and delete `.npmrc`. They are the English-named packages of
`@nhatnguyet/am-lich` and `@nhatnguyet/tu-vi` (same code, same API).

## Files

| File | What it does |
|---|---|
| `src/replies.js` | the text of every reply, plain functions |
| `src/bot.js` | `createBot(token)`: the commands, wired to the replies |
| `src/main.js` | reads `BOT_TOKEN`, registers the command menu, starts polling |

Zi Wei Dou Shu is a traditional system, not validated
science; the bot gives computed data, not advice.

Data: Nhat Nguyet (nhatnguyet.org)
