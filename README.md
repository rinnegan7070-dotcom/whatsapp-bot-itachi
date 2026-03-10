# Itachi WhatsApp Bot (JavaScript)

Bot de WhatsApp para grupos em **JavaScript** com múltiplas funções:

- Comandos de utilidade (`!menu`, `!ping`, `!perfil`)
- Brincadeiras (`!piada`, `!flip`, `!roll`, `!jokenpo`)
- Música direto do YouTube (`!play <termo>`)
- Sticker de imagem/vídeo (`!sticker`)
- Administração de grupos (`!abrir`, `!fechar`, `!kick`, `!ban`, `!promote`, `!demote`, `!marcartodos`)

## Requisitos

- Node.js 18+
- Conta WhatsApp para escanear o QR Code

## Instalação

```bash
npm install
cp .env.example .env
npm start
```

No primeiro start, escaneie o QR Code no terminal.

## Comandos

Prefixo padrão: `!`

- `!menu`
- `!ping`
- `!perfil`
- `!piada`
- `!flip`
- `!roll <numero>`
- `!jokenpo <pedra|papel|tesoura>`
- `!play <nome da musica>`
- `!sticker` (responder imagem/vídeo ou enviar com legenda)
- `!abrir`
- `!fechar`
- `!kick @usuario`
- `!ban @usuario`
- `!promote @usuario`
- `!demote @usuario`
- `!marcartodos`

## Estrutura

```text
src/
  index.js
  commands/index.js
  services/sticker.js
  services/youtube.js
  utils/whatsapp.js
```

## Observações

- `!play` depende do YouTube estar acessível.
- `!sticker` usa `sharp`, `ffmpeg-static` e `node-webpmux`.
- Comandos de moderação exigem admin no grupo.
