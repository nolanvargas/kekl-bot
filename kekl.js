export async function startKEKL(channelId, rest) {
    const preMap = 60; // 1 minute
    const mapping = 60 * 15; // 15 minutes
    const validating = 300; // 5 minutes
  
    const labels = [
      'Launch Map Editor -',
      'Mapping -',
      'Validating -'
    ];
    const durations = [preMap, mapping, validating];
  
    for (let i = 0; i < labels.length; i++) {
      await loadStatus(channelId, rest, labels[i], durations[i]);
    }
  }
  
  function loadStatus(channelId, rest, label, time) {
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
          resolve();
        }
      }, 1000);
    });
  }
  