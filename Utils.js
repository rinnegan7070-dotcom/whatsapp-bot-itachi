export async function sendText(sock, from, text) {
  await sock.sendMessage(from, { text })
}

// Função para verificar se usuário é admin
export async function isAdmin(sock, groupId, userId) {
  const metadata = await sock.groupMetadata(groupId)
  return metadata.participants.find(p => p.id === userId)?.admin !== undefined
}
