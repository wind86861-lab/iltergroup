/**
 * Telegram Bot notifications for new orders and messages.
 *
 * Setup:
 * 1. Message @BotFather on Telegram → /newbot → name it → get token
 * 2. Add the bot to your group chat
 * 3. Send any message in the group, then visit:
 *    https://api.telegram.org/bot<TOKEN>/getUpdates
 * 4. Look for `"chat":{"id":-123456789,...}` — that negative number is your CHAT_ID
 * 5. Set env vars:
 *    TELEGRAM_BOT_TOKEN=your_bot_token
 *    TELEGRAM_CHAT_ID=-123456789
 */

import https from 'https'

function send(text: string): Promise<void> {
  // Read at call time so the values from .env are always picked up.
  const TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID || ''
  return new Promise((resolve, reject) => {
    if (!TOKEN || !CHAT_ID) {
      console.warn('[Telegram] Not configured — set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID')
      return resolve()
    }

    const payload = JSON.stringify({
      chat_id: CHAT_ID,
      text,
      parse_mode: 'HTML',
    })

    const req = https.request(
      {
        hostname: 'api.telegram.org',
        path: `/bot${TOKEN}/sendMessage`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve()
          } else {
            console.error('[Telegram] API error:', data)
            reject(new Error(`Telegram API ${res.statusCode}`))
          }
        })
      }
    )

    req.on('error', (err) => {
      console.error('[Telegram] Request error:', err.message)
      reject(err)
    })

    req.write(payload)
    req.end()
  })
}

export async function notifyOrder(order: {
  id: number
  customer: string
  phone: string
  email?: string
  total: number
  notes?: string
  createdAt: Date
}) {
  const lines = [
    '<b>🛒 Yangi buyurtma / Новый заказ</b>',
    '',
    `<b>ID:</b> #${order.id}`,
    `<b>Ism / Имя:</b> ${escapeHtml(order.customer)}`,
    `<b>Telefon / Телефон:</b> ${escapeHtml(order.phone)}`,
    order.email ? `<b>Email:</b> ${escapeHtml(order.email)}` : null,
    `<b>Summa / Сумма:</b> ${order.total.toLocaleString()} so'm`,
    order.notes ? `<b>Izoh / Примечание:</b> ${escapeHtml(order.notes)}` : null,
    '',
    `<i>${order.createdAt.toLocaleString('uz-UZ')}</i>`,
  ].filter(Boolean)

  try {
    await send(lines.join('\n'))
  } catch {
    // Non-blocking: don't crash the request if Telegram fails
  }
}

export async function notifyMessage(msg: {
  id: number
  name: string
  phone: string
  comment: string
  createdAt: Date
}) {
  const lines = [
    '<b>✉️ Yangi xabar / Новое сообщение</b>',
    '',
    `<b>ID:</b> #${msg.id}`,
    `<b>Ism / Имя:</b> ${escapeHtml(msg.name)}`,
    `<b>Telefon / Телефон:</b> ${escapeHtml(msg.phone)}`,
    `<b>Xabar / Сообщение:</b> ${escapeHtml(msg.comment)}`,
    '',
    `<i>${msg.createdAt.toLocaleString('uz-UZ')}</i>`,
  ]

  try {
    await send(lines.join('\n'))
  } catch {
    // Non-blocking
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
