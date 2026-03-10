import yts from 'yt-search';
import ytdl from 'ytdl-core';

export async function searchYouTube(query) {
  const result = await yts(query);
  if (!result.videos.length) return null;
  return result.videos[0];
}

export async function downloadAudioBuffer(url) {
  const chunks = [];

  await new Promise((resolve, reject) => {
    ytdl(url, { quality: 'highestaudio', filter: 'audioonly' })
      .on('data', (chunk) => chunks.push(chunk))
      .on('end', resolve)
      .on('error', reject);
  });

  return Buffer.concat(chunks);
}
