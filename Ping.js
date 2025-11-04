import { sendText } from '../utils/utils.js'
export async function run({ sock, msg, from }) {
  await sendText(sock, from, '🏓 Pong! Estou online!')
}
