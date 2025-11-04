import { sendText } from '../utils/utils.js'
import fs from 'fs'

export async function run({ sock, msg, from, pushName }) {
  const imagePath = './assets/menu_itachi.jpg'
  const menuText = `
🩸 〘 𝐈𝐓𝐀𝐂𝐇𝐈 𝐁𝐎𝐓 〙🩸
━━━━━━━━━━━━━━━━━━━━━━
👤 Usuário: *${pushName}*
🔥 Prefixo: !
🩶 Status: Online

🌀 ✦ ✧ Comandos para TODOS ✧ ✦ 🌀
⚡ !menu           — Abrir este menu
🏓 !ping           — Testar conexão
👤 !perfil         — Mostrar perfil do usuário

🔒 ✦ ✧ Comandos apenas para ADMINS ✧ ✦ 🔒
🎭 !menu brincadeira — Comandos de diversão
🤣 !piada            — Piada aleatória
🪨 !jokenpo          — Pedra, papel ou tesoura
🪙 !flip             — Cara ou coroa
🎲 !roll <n>         — Rolar dados
🖼️ !sticker         — Criar figurinha
🎵 !play <nome>      — Tocar música / Buscar música
💀 !ban @usuário     — Banir membro
👺 !kick @usuário    — Remover membro
👑 !promote @usuário — Tornar admin
⚔️ !demote @usuário  — Tirar admin
🌸 !welcome <on/off> — Mensagens de boas-vindas
🔓 !abrir            — Abrir grupo para todos
🔒 !fechar           — Fechar grupo só para admins
🧹 !limpar           — Apagar mensagem marcada
👁️‍🗨️ !marcartodos    — Mencionar todos membros
🌀 !setmenu <tema>   — Alterar tema do menu

━━━━━━━━━━━━━━━━━━━━━━
👁️‍🗨️ “Mesmo que toda a luz se apague, o Mangekyō guiará o caminho.”
〘 𝐈𝐓𝐀𝐂𝐇𝐈 𝐁𝐎𝐓 — 𝐂𝐋Ã 𝐔𝐂𝐇𝐈𝐇𝐀 〙
`
  try {
    await sock.sendMessage(from, { 
      image: { url: imagePath }, 
      caption: menuText 
    })
  } catch (e) {
    await sendText(sock, from, menuText)
  }
}
