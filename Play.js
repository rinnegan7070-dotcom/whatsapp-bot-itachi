import { sendText } from '../utils/utils.js'
export async function run({ sock, msg, from, args }) {
  if (!args || args.length === 0) return sendText(sock, from, 'Use: !play <nome da música>')
  const term = args.join(' ')
  await sendText(sock, from, `🎵 Procurando e tocando: ${term} (placeholder)`)
}
