const { Telegraf } = require("telegraf");
const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Telegram Bot Token
const BOT_TOKEN = process.env.TELEGRAM_API_TOKEN;
const bot = new Telegraf(BOT_TOKEN);

const yahooFinance = require("yahoo-finance2").default;

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
    // Fetch stock data using Yahoo Finance API
    const stockData = await yahooFinance.quote(ticker);
    console.log(stockData);

    if (stockData && stockData.regularMarketPrice) {
      const price = stockData.regularMarketPrice;
      const changePercent = stockData.regularMarketChangePercent.toFixed(2);
      const marketCap = stockData.marketCap
        ? `$${(stockData.marketCap / 1e9).toFixed(2)}B`
        : "N/A";

      ctx.reply(
        `📈 ${ticker} Stock Price:\n` +
          `- Current Price: $${price}\n` +
          `- Change: ${changePercent}%\n` +
          `- Market Cap: ${marketCap}`
      );
    } else {
      ctx.reply(`Could not fetch price for ${ticker}. Please try again.`);
    }
  } catch (error) {
    console.error(error);
    ctx.reply(`Error fetching data for ${ticker}: ${error.message}`);
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
