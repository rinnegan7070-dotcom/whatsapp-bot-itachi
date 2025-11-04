import { default as makeWASocket, useSingleFileAuthState, fetchLatestBaileysVersion, DisconnectReason } from '@adiwajshing/baileys'
import { Boom } from '@hapi/boom'
import P from 'pino'
import fs from 'fs'

// Utils
import { sendText, isAdmin } from './utils/utils.js'

// Comandos
import * as menu from './commands/menu.js'
import * as ping from './commands/ping.js'
import * as perfil from './commands/perfil.js'
import * as sticker from './commands/sticker.js'
import * as play from './commands/play.js'

// Autenticação
const { state, saveState } = useSingleFileAuthState('./auth_info.json')

async function startBot() {
    const { version, isLatest } = await fetchLatestBaileysVersion()
    const sock = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state,
        version
    })

    sock.ev.on('creds.update', saveState)

    // Mensagens recebidas
    sock.ev.on('messages.upsert', async (m) => {
        try {
            const msg = m.messages[0]
            if (!msg.message || msg.key.fromMe) return
            const from = msg.key.remoteJid
            const text = msg.message.conversation || msg.message?.extendedTextMessage?.text
            const pushName = msg.pushName || 'Usuário'

            if (!text) return

            const args = text.trim().split(/ +/).slice(1)
            const command = text.trim().split(/ +/)[0].toLowerCase()

            // TODOS
            if (command === '!menu') await menu.run({ sock, msg, from, pushName })
            else if (command === '!ping') await ping.run({ sock, msg, from })
            else if (command === '!perfil') await perfil.run({ sock, msg, from, pushName })

            // Só ADM
            else if (['!sticker','!play','!abrir','!fechar','!ban','!kick','!promote','!demote','!limpar','!marcartodos'].includes(command)) {
                const admin = await isAdmin(sock, from, msg.key.participant || msg.key.remoteJid)
                if (!admin) {
                    await sendText(sock, from, '❌ Apenas administradores podem usar este comando.')
                    return
                }
                if (command === '!sticker') await sticker.run({ sock, msg, from })
                else if (command === '!play') await play.run({ sock, msg, from, args })
                // Outros comandos ADM podem ser adicionados aqui
            }

        } catch (err) {
            console.log('Erro na mensagem:', err)
        }
    })

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            if ((lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut) {
                startBot()
            } else {
                console.log('Conexão encerrada, faça login novamente.')
            }
        } else if (connection === 'open') {
            console.log('✅ Bot Itachi conectado!')
        }
    })
}

startBot()
