import { sendText } from '../utils/utils.js'
export async function run({ sock, msg, from, pushName }) {
  await sendText(sock, from, `👤 Perfil de ${pushName}\nNúmero: ${msg.key.participant || msg.key.remoteJid}`)
}
