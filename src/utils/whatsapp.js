export const isGroup = (jid = '') => jid.endsWith('@g.us');

export const getTextFromMessage = (message) => {
  if (!message) return '';
  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    message.videoMessage?.caption ||
    ''
  );
};

export const getSenderId = (msg) => msg.key.participant || msg.key.remoteJid;

export async function sendText(sock, jid, text, options = {}) {
  return sock.sendMessage(jid, { text, ...options });
}

export async function getGroupMetadata(sock, jid) {
  if (!isGroup(jid)) return null;
  return sock.groupMetadata(jid);
}

export async function isAdmin(sock, jid, userId) {
  const metadata = await getGroupMetadata(sock, jid);
  if (!metadata) return false;
  const participant = metadata.participants.find((p) => p.id === userId);
  return ['admin', 'superadmin'].includes(participant?.admin);
}

export async function ensureGroupAdmin(sock, jid, userId) {
  if (!isGroup(jid)) {
    return { ok: false, reason: 'Este comando funciona apenas em grupos.' };
  }

  const admin = await isAdmin(sock, jid, userId);
  if (!admin) {
    return { ok: false, reason: '❌ Apenas administradores podem usar este comando.' };
  }

  return { ok: true };
}

export function extractMentionedIds(msg) {
  return msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
}
