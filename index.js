const { Telegraf } = require("telegraf");
const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Telegram Bot Token
const BOT_TOKEN = process.env.TELEGRAM_API_TOKEN;
const bot = new Telegraf(BOT_TOKEN);

// Command Handlers
bot.start((ctx) =>
  ctx.reply(
    "Welcome to Stock Bot! Use /price <TICKER> to get stock data or /alerts <TICKER> to subscribe for alerts."
  )
);

bot.command("price", async (ctx) => {
  const message = ctx.message.text.split(" ");
  if (message.length < 2) {
    ctx.reply("Usage: /price <TICKER>");
    return;
  }
  const ticker = message[1].toUpperCase();
  try {
    const response = await axios.get(
      `https://finance.yahoo.com/quote/${ticker}`
    );
    // Simplified response parsing; use a proper finance API for production
    const regex = /"regularMarketPrice":\{"raw":([\d.]+),"fmt":"([\d.]+)"/;
    const match = response.data.match(regex);
    if (match) {
      const price = match[1];
      ctx.reply(`The current price of ${ticker} is $${price}`);
    } else {
      ctx.reply(`Could not fetch price for ${ticker}. Please try again.`);
    }
  } catch (error) {
    ctx.reply(`Error fetching data: ${error.message}`);
  }
});

bot.command("alerts", (ctx) => {
  const message = ctx.message.text.split(" ");
  if (message.length < 2) {
    ctx.reply("Usage: /alerts <TICKER>");
    return;
  }
  const ticker = message[1].toUpperCase();
  ctx.reply(
    `Subscribed to alerts for ${ticker}. (Feature not yet implemented)`
  );
});

bot.command("unsubscribe", (ctx) => {
  const message = ctx.message.text.split(" ");
  if (message.length < 2) {
    ctx.reply("Usage: /unsubscribe <TICKER>");
    return;
  }
  const ticker = message[1].toUpperCase();
  ctx.reply(
    `Unsubscribed from alerts for ${ticker}. (Feature not yet implemented)`
  );
});

// Setup Webhook
app.use(bot.webhookCallback("/webhook"));

// A simple route to test the server
app.get("/", (req, res) => {
  res.send("Stock Bot is running!");
});

// Set Telegram webhook
bot.telegram.setWebhook(`${process.env.WEBHOOK_URL}/webhook`);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
