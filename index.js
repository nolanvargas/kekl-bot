import dotenv from 'dotenv';
dotenv.config();

import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,               // Required for slash commands and general presence
      GatewayIntentBits.GuildMessages,        // To receive messages in channels
      GatewayIntentBits.MessageContent,       // To read the actual message content (needed if you're parsing commands)
      GatewayIntentBits.DirectMessages,       // To handle map file uploads via DM
      GatewayIntentBits.GuildVoiceStates,     // To track users joining/leaving VC (for highlighting)
    ]
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
  
    const targetHour = 10; // 10 AM (24-hour format)
    const targetMinute = 30; // 10:30 AM
    const channelId = process.env.CHANNEL_ID;
  
    // Check every minute
    setInterval(async () => {
      const now = new Date();
      if (now.getHours() === targetHour && now.getMinutes() === targetMinute) {
        const channel = await client.channels.fetch(channelId);
        if (channel) {
          channel.send('It’s go time! 🚀');
        }
      }
    }, 60 * 1000); // every 1 minute
  });

client.login(process.env.DISCORD_TOKEN);
