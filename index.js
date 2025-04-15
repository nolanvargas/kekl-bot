import dotenv from 'dotenv';
dotenv.config();

import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js';
import {
  joinVoiceChannel,
  VoiceConnectionStatus,
  entersState,
  getVoiceConnection
} from '@discordjs/voice';
import { startKEKL } from './kekl.js';

const commands = [
  new SlashCommandBuilder()
    .setName('joinvc')
    .setDescription('Have the bot join your current voice channel')
    .toJSON(),
  new SlashCommandBuilder()
    .setName('beginkekl')
    .setDescription('Start the KEKL countdown in the current voice channel')
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
  ],
  partials: ['CHANNEL'], // 👈 Required for DMs!
});

client.on('error', console.error);
client.on('shardError', console.error);


/////////////////////////////////////////////////////////////
// Join VC command
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
    } catch (err) {
      console.error('Failed to join VC:', err);
      await interaction.reply('❌ Failed to join VC');
    }
  } else if (interaction.commandName === 'beginkekl') {
    const connection = getVoiceConnection(interaction.guild.id);

    if (!connection || connection.state.status !== VoiceConnectionStatus.Ready) {
      await interaction.reply({
      content: '❌ Bot is not connected to a voice channel. Use /joinvc first.',
      ephemeral: true // Only visible to the user
      });
      return;
    }

    try {
      startKEKL(connection, process.env.GENERAL_VC_ID, rest); // 1 minute countdown
      await interaction.reply('✅ KEKL countdown started!');
    } catch (err) {
      console.error('Failed to start KEKL:', err);
      await interaction.reply('❌ Failed to start KEKL countdown.');
    }
}});

/////////////////////////////////////////////////////////////
// Message on schedule
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  
  // const wednesdayHour = 14; // 2 PM PST
  // const wednesdayMinute = 45;
  const wednesdayHour = 12; // 2 PM PST
  const wednesdayMinute = 0;
  const saturdayHour = 18; // 6 PM PST
  const saturdayMinute = 0;
  const channelId = process.env.GENERAL_CHANNEL_ID;

  setInterval(async () => {
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
    console.log(`[${now.toLocaleTimeString()}] Checking time...`);

    // const isWednesday = now.getDay() === 3; // Wednesday
    const isWednesday = now.getDay() === 2; // Wednesday
    const isSaturday = now.getDay() === 6; // Saturday

    if (
      (isWednesday && now.getHours() === wednesdayHour && now.getMinutes() === wednesdayMinute) ||
      (isSaturday && now.getHours() === saturdayHour && now.getMinutes() === saturdayMinute)
    ) {
      console.log('🎯 Time match — sending message...');
      try {
        const channel = await client.channels.fetch(channelId);
        if (channel) {
          const oneHourLater = Math.floor(now.getTime() / 1000) + 3600; // Epoch time for 1 hour ahead
          await channel.send(`@KEKL <t:${oneHourLater}:R> 🚀`);
        }
      } catch (err) {
        console.error('❌ Failed to send message:', err);
      }
    }
  }, 60 * 1000);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  console.log('📨 Message received!');
  console.log('Channel type:', message.channel.type);

  if (message.channel.type === 1) { // 1 = DMChannel
    console.log(`📩 DM from ${message.author.tag}: ${message.content}`);
  }
});


/////////////////////////////////////////////////////////////

// client.on('messageCreate', async (message) => {
//   console.dir(message)
//   // Ignore messages from bots
//   if (message.author.bot) return;

//   // Only process DMs
//   if (message.channel.type !== 1) return; // 1 = DM

//   // Check for attachments
//   if (message.attachments.size === 0) {
//     await message.reply('❌ Please send a map file as an attachment.');
//     return;
//   }

//   // Check file type
//   const attachment = message.attachments.first();
//   const fileName = attachment.name || '';
//   if (!fileName.endsWith('.Map.Gbx')) {
//     await message.reply('❌ Invalid file type. Please upload a `.Map.Gbx` file.');
//     return;
//   }

//   // Download the file (use HTTPS module or axios, example below)
//   const fileUrl = attachment.url;
//   console.log(`Received map from ${message.author.tag}: ${fileName}`);
//   console.log(`URL: ${fileUrl}`);

//   // Optional: acknowledge receipt
//   await message.reply('Thanks');

//   // Optional: store metadata or download file here
// });


client.login(process.env.DISCORD_TOKEN);


// Ensure Railway doesn't shut the process down
setInterval(() => {}, 60 * 60 * 1000);
process.on('unhandledRejection', (err) => {
  console.error('Unhandled promise rejection:', err);
});

