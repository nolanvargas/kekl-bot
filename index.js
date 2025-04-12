import dotenv from 'dotenv';
dotenv.config();

import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js';
import {
  joinVoiceChannel,
  VoiceConnectionStatus,
  entersState
} from '@discordjs/voice';

const commands = [
  new SlashCommandBuilder()
    .setName('joinvc')
    .setDescription('Have the bot join your current voice channel')
    .toJSON()
];
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

try {
  console.log('Registering slash command...');
  await rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID),
    { body: commands }
  );
  console.log('✅ Slash command registered');
} catch (err) {
  console.error('Error registering command:', err);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildVoiceStates,
  ]
});
client.login(process.env.DISCORD_TOKEN);

client.on('error', console.error);
client.on('shardError', console.error);

/////////////////////////////////////////////////////////////

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'joinvc') {
    try {
      const connection = joinVoiceChannel({
        channelId: process.env.GENERAL_VC_ID,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator
      });
      
      await entersState(connection, VoiceConnectionStatus.Ready, 5_000);
      await interaction.reply(`✅ Joined General VC`);
      await rest.put(
        `/channels/${process.env.GENERAL_VC_ID}/voice-status`,
        {
          body: {
            status: '🚀 GO TIME'
          }
        }
      );
    } catch (err) {
      console.error('Failed to join VC:', err);
      await interaction.reply('❌ Failed to join VC');
    }
  }
});

/////////////////////////////////////////////////////////////

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const targetHour = 11;  // 11 AM PST
  const targetMinute = 23;
  const channelId = process.env.GENERAL_CHANNEL_ID;

  setInterval(async () => {
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
    console.log(`[${now.toLocaleTimeString()}] Checking time...`);

    if (now.getHours() === targetHour && now.getMinutes() === targetMinute) {
      console.log('🎯 Time match — sending message...');
      try {
        const channel = await client.channels.fetch(channelId);
        if (channel) {
          await channel.send('It’s go time in <t:1744482600:R> 🚀');
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
