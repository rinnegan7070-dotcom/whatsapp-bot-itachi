import { downloadMediaMessage } from '@whiskeysockets/baileys';
import {
  ensureGroupAdmin,
  extractMentionedIds,
  getGroupMetadata,
  sendText
} from '../utils/whatsapp.js';
import { imageToSticker, videoToSticker } from '../services/sticker.js';
import { downloadAudioBuffer, searchYouTube } from '../services/youtube.js';

const piadas = [
  'Por que o computador foi ao médico? Porque ele estava com um vírus!',
  'Qual o contrário de volátil? Vem cá sobrinho.',
  'Por que o JavaScript foi triste? Porque não sabia como "null" seus sentimentos.'
];

const jokenpoChoices = ['pedra', 'papel', 'tesoura'];

function getQuotedMessage(msg) {
  return msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
}

function usage(prefix) {
  return [
    '📜 *Menu de comandos*',
    `${prefix}menu`,
    `${prefix}ping`,
    `${prefix}perfil`,
    `${prefix}piada`,
    `${prefix}flip`,
    `${prefix}roll <número>`,
    `${prefix}jokenpo <pedra|papel|tesoura>`,
    `${prefix}play <nome da música>`,
    `${prefix}sticker (responda imagem/vídeo)`,
    `${prefix}abrir | ${prefix}fechar`,
    `${prefix}kick @membro | ${prefix}ban @membro`,
    `${prefix}promote @membro | ${prefix}demote @membro`,
    `${prefix}marcartodos`
  ].join('\n');
}

export async function handleCommand({ sock, msg, from, sender, prefix, command, args }) {
  switch (command) {
    case 'menu':
      return sendText(sock, from, usage(prefix));

    case 'ping':
      return sendText(sock, from, '🏓 Pong! Bot online.');

    case 'perfil':
      return sendText(sock, from, `👤 Seu ID: ${sender}`);

    case 'piada':
      return sendText(sock, from, `🤣 ${piadas[Math.floor(Math.random() * piadas.length)]}`);

    case 'flip':
      return sendText(sock, from, `🪙 Resultado: *${Math.random() > 0.5 ? 'Cara' : 'Coroa'}*`);

    case 'roll': {
      const sides = Number(args[0] || 6);
      if (!Number.isInteger(sides) || sides < 2) {
        return sendText(sock, from, 'Use: !roll <número maior que 1>');
      }
      const value = Math.floor(Math.random() * sides) + 1;
      return sendText(sock, from, `🎲 Dado d${sides}: *${value}*`);
    }

    case 'jokenpo': {
      const user = (args[0] || '').toLowerCase();
      if (!jokenpoChoices.includes(user)) {
        return sendText(sock, from, 'Use: !jokenpo <pedra|papel|tesoura>');
      }
      const bot = jokenpoChoices[Math.floor(Math.random() * jokenpoChoices.length)];
      const draw = user === bot;
      const win =
        (user === 'pedra' && bot === 'tesoura') ||
        (user === 'papel' && bot === 'pedra') ||
        (user === 'tesoura' && bot === 'papel');
      const result = draw ? 'Empate!' : win ? 'Você venceu! 🎉' : 'Você perdeu! 😅';
      return sendText(sock, from, `✊ Você: ${user}\n🤖 Bot: ${bot}\n${result}`);
    }

    case 'play': {
      if (!args.length) return sendText(sock, from, 'Use: !play <nome da música>');
      const query = args.join(' ');
      await sendText(sock, from, `🔎 Buscando no YouTube: *${query}*`);

      const found = await searchYouTube(query);
      if (!found) return sendText(sock, from, 'Não encontrei resultados.');

      await sendText(sock, from, `⬇️ Baixando: *${found.title}*`);
      const audio = await downloadAudioBuffer(found.url);

      await sock.sendMessage(from, {
        audio,
        mimetype: 'audio/mpeg',
        fileName: `${found.title}.mp3`
      });
      return;
    }

    case 'sticker': {
      const quoted = getQuotedMessage(msg);
      const mediaMessage = quoted || msg.message;
      const messageType = mediaMessage?.imageMessage
        ? 'image'
        : mediaMessage?.videoMessage
        ? 'video'
        : null;

      if (!messageType) {
        return sendText(sock, from, 'Responda uma imagem/vídeo com !sticker ou envie com legenda !sticker.');
      }

      const mediaBuffer = await downloadMediaMessage(
        { message: mediaMessage, key: msg.key },
        'buffer',
        {},
        { logger: undefined, reuploadRequest: sock.updateMediaMessage }
      );

      const stickerBuffer =
        messageType === 'image'
          ? await imageToSticker(mediaBuffer)
          : await videoToSticker(mediaBuffer);

      await sock.sendMessage(from, { sticker: stickerBuffer });
      return;
    }

    case 'abrir':
    case 'fechar':
    case 'kick':
    case 'ban':
    case 'promote':
    case 'demote':
    case 'marcartodos': {
      const guard = await ensureGroupAdmin(sock, from, sender);
      if (!guard.ok) return sendText(sock, from, guard.reason);

      if (command === 'abrir') {
        await sock.groupSettingUpdate(from, 'not_announcement');
        return sendText(sock, from, '✅ Grupo aberto para todos enviarem mensagem.');
      }

      if (command === 'fechar') {
        await sock.groupSettingUpdate(from, 'announcement');
        return sendText(sock, from, '🔒 Grupo fechado (somente admins).');
      }

      if (command === 'marcartodos') {
        const metadata = await getGroupMetadata(sock, from);
        const ids = metadata.participants.map((p) => p.id);
        const text = ids.map((id) => `@${id.split('@')[0]}`).join(' ');
        return sock.sendMessage(from, { text: `📣 Chamando todos:\n${text}`, mentions: ids });
      }

      const mentioned = extractMentionedIds(msg);
      if (!mentioned.length) {
        return sendText(sock, from, 'Marque o membro alvo. Ex: !kick @usuario');
      }

      const action = ['kick', 'ban'].includes(command) ? 'remove' : command === 'promote' ? 'promote' : 'demote';
      await sock.groupParticipantsUpdate(from, mentioned, action);
      return sendText(sock, from, `✅ Ação *${command}* executada.`);
    }

    default:
      return null;
  }
}
