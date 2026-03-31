import { sendText } from '../utils/helpers.js';
import { convertToSticker } from '../services/sticker.js';

export async function run({ sock, msg, from }) {
  try {
    const media = msg.message?.imageMessage || msg.message?.videoMessage;
    
    if (!media) {
      return sendText(sock, from, '❌ Envie uma imagem ou vídeo para criar figurinha!');
    }

    await sendText(sock, from, '⏳ Convertendo para figurinha...');
    
    const stickerBuffer = await convertToSticker(media);
    
    await sock.sendMessage(from, { 
      sticker: stickerBuffer
    });

    console.log('✅ Figurinha criada com sucesso');
  } catch (error) {
    console.error('Erro ao criar figurinha:', error);
    await sendText(sock, from, `❌ Erro ao criar figurinha: ${error.message}`);
  }
}