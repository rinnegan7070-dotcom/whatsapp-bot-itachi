import { sendText } from '../utils/utils.js'
export async function run({ sock, msg, from }) {
  try {
    const media = msg.message?.imageMessage || msg.message?.videoMessage
    if (!media) return sendText(sock, from, 'Envie uma imagem ou vídeo para criar a figurinha!')
    await sock.sendMessage(from, { sticker: { url: media.url } })
  } catch (e) {
    await sendText(sock, from, 'Erro ao criar figurinha: ' + (e.message || e))
  }
}
