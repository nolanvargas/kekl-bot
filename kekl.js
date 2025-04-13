import { playSoundEffect } from "audio.js";

export async function startKEKL(connection, channelId, rest) {
    // const preMap = 60; // 1 minute
    // const mapping = 60 * 15; // 15 minutes
    // const validating = 300; // 5 minutes
    // const timessUp = 0; 
    const preMap = 6; // 1 minute
    const mapping = 6; // 15 minutes
    const validating = 6; // 5 minutes
    const timessUp = 0; 
  
    const labels = [
      'Launch Map Editor -',
      'Mapping -',
      'Validating -',
      'Times Up! Submit your maps'
    ];
    const sounds = [
      '',
      'begin.mp3',
      'transition.mp3',
      'endtime.mp3'
    ];
    const durations = [preMap, mapping, validating];
  
    for (let i = 0; i < labels.length; i++) {
      await loadStatus(connection, channelId, rest, labels[i], durations[i], sounds[i]);
    }
  }
  
  function loadStatus(connection, channelId, rest, label, time, sound) {
    return new Promise((resolve) => {
      const interval = setInterval(async () => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        const display = `${minutes}:${seconds.toString().padStart(2, '0')} remaining`;
  
        try {
          await rest.put(`/channels/${channelId}/voice-status`, {
            body: { status: `${label} ${display}` }
          });
        } catch (err) {
          console.error(`❌ Failed to update voice status (${label}):`, err);
          clearInterval(interval);
          return resolve(); // still resolve so flow continues
        }
  
        time--;
  
        if (time < 0) {
          clearInterval(interval);
          playSoundEffect(connection, channelId, sound).catch(console.error);
          resolve();
        }
      }, 1000);
    });
  }
  