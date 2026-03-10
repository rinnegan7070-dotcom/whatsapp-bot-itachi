import 'dotenv/config';
import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  useMultiFileAuthState
} from '@whiskeysockets/baileys';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import { handleCommand } from './commands/index.js';
import { getSenderId, getTextFromMessage } from './utils/whatsapp.js';

const prefix = process.env.PREFIX || '!';
const logger = pino({ level: 'silent' });

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');
  const { version } = await fetchLatestBaileysVersion();
  const store = makeInMemoryStore({ logger });

  const sock = makeWASocket({
    auth: state,
    logger,
    printQRInTerminal: true,
    version,
    syncFullHistory: false,
    markOnlineOnConnect: true,
    browser: ['Itachi Bot', 'Chrome', '1.0.0']
  });

  store.bind(sock.ev);
  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages }) => {
    try {
      const msg = messages[0];
      if (!msg?.message || msg.key.fromMe) return;

      const text = getTextFromMessage(msg.message)?.trim();
      if (!text?.startsWith(prefix)) return;

      const from = msg.key.remoteJid;
      const sender = getSenderId(msg);
      const [rawCommand, ...args] = text.slice(prefix.length).split(/\s+/);
      const command = (rawCommand || '').toLowerCase();

      await handleCommand({ sock, msg, from, sender, prefix, command, args });
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
    }
  });

  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      console.log('✅ Bot conectado com sucesso.');
      return;
    }

    if (connection === 'close') {
      const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log('Conexão encerrada.', { statusCode, shouldReconnect });
      if (shouldReconnect) startBot();
    }
  });
}

startBot();
