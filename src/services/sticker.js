import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import webpmux from 'node-webpmux';

ffmpeg.setFfmpegPath(ffmpegPath);

const STICKER_PACK = 'ItachiBot';
const STICKER_AUTHOR = 'WhatsApp Group Bot';

async function writeExif(webpBuffer) {
  const img = new webpmux.Image();
  await img.load(webpBuffer);

  const json = {
    'sticker-pack-id': 'itachi-bot-pack',
    'sticker-pack-name': STICKER_PACK,
    'sticker-pack-publisher': STICKER_AUTHOR,
    emojis: ['🔥']
  };

  const exifAttr = Buffer.from(JSON.stringify(json), 'utf8');
  const exif = Buffer.concat([
    Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00]),
    Buffer.from([exifAttr.length, 0x00, 0x00, 0x00]),
    exifAttr
  ]);

  img.exif = exif;
  return img.save(null);
}

export async function imageToSticker(buffer) {
  const webp = await sharp(buffer)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 90 })
    .toBuffer();

  return writeExif(webp);
}

export async function videoToSticker(buffer) {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'itachi-'));
  const input = path.join(tmpDir, 'input.mp4');
  const output = path.join(tmpDir, 'output.webp');

  await fs.writeFile(input, buffer);

  await new Promise((resolve, reject) => {
    ffmpeg(input)
      .outputOptions([
        '-vcodec libwebp',
        '-vf',
        "scale=min(512\,iw):min(512\,ih):force_original_aspect_ratio=decrease,fps=15,pad=512:512:-1:-1:color=white@0.0",
        '-loop 0',
        '-ss 00:00:00',
        '-t 00:00:07',
        '-preset default',
        '-an',
        '-vsync 0'
      ])
      .save(output)
      .on('end', resolve)
      .on('error', reject);
  });

  const webp = await fs.readFile(output);
  await fs.rm(tmpDir, { recursive: true, force: true });
  return writeExif(webp);
}
