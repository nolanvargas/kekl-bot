import { createAudioPlayer, createAudioResource, getVoiceConnection, AudioPlayerStatus } from '@discordjs/voice';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function playSoundEffect(connection, channelId, filename) {
  if (!filename) return;
  if (!connection) {
    console.warn(`⚠️ No active voice connection. Cannot play: ${filename}`);
    return;
  }

  try {
    const player = createAudioPlayer();
    const resource = createAudioResource(path.join(__dirname, 'sounds', filename));

    connection.subscribe(player);
    resource.volume?.setVolume(0.4);
    player.play(resource);

    player.on(AudioPlayerStatus.Idle, () => {
      player.stop(); // optional cleanup
    });

    console.log(`🔊 Playing sound: ${filename}`);
  } catch (err) {
    console.error(`❌ Error playing sound effect "${filename}":`, err);
  }
}
