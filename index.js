import dotenv from 'dotenv';
dotenv.config();

import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildVoiceStates,
  ]
});

client.on('error', console.error);
client.on('shardError', console.error);

client.login(process.env.DISCORD_TOKEN);

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const targetHour = 11;  // 11 AM PST
  const targetMinute = 14;
  const channelId = process.env.GENERAL_CHANNEL_ID;

  setInterval(async () => {
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
    console.log(`[${now.toLocaleTimeString()}] Checking time...`);

    if (now.getHours() === targetHour && now.getMinutes() === targetMinute) {
      console.log('🎯 Time match — sending message...');
      try {
        const channel = await client.channels.fetch(channelId);
        if (channel) {
          await channel.send('It’s go time! 🚀');
        }
      } catch (err) {
        console.error('❌ Failed to send message:', err);
      }
    }
  }, 60 * 1000);
});

// Ensure Railway doesn't shut the process down
setInterval(() => {}, 60 * 60 * 1000);
process.on('unhandledRejection', (err) => {
  console.error('Unhandled promise rejection:', err);
});
