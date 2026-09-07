import { formatMoney } from './money.js'
import { formatPersianDate } from './date.js'
import { formatCardNumber, formatSheba } from './bank.js'

const SITE_URL = 'dongban.ir'

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + width, y, x + width, y + height, r)
  ctx.arcTo(x + width, y + height, x, y + height, r); ctx.arcTo(x, y + height, x, y, r)
  ctx.arcTo(x, y, x + width, y, r); ctx.closePath()
}

function fitText(ctx, text, maxWidth, initialSize, minimumSize = 28) {
  let size = initialSize
  do { ctx.font = `800 ${size}px Estedad`; size -= 2 } while (ctx.measureText(text).width > maxWidth && size > minimumSize)
}

const imageCache = new Map()
function loadBankImage(bankKey) {
  if (typeof Image === 'undefined') return Promise.resolve(null)
  const key = (!bankKey || bankKey === 'no-img') ? 'no-img' : bankKey
  if (imageCache.has(key)) return Promise.resolve(imageCache.get(key))
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imageCache.set(key, img)
      resolve(img)
    }
    img.onerror = () => resolve(null)
    img.src = `/icons/bank/${key}.png`
  })
}

export async function createSettlementImage(event, result, creditors = []) {
  await document.fonts?.ready

  const creditorAccounts = []
  if (Array.isArray(creditors)) {
    creditors.forEach((c) => {
      if (c.accounts && c.accounts.length) {
        c.accounts.forEach((acc) => {
          creditorAccounts.push({
            personName: c.name,
            ...acc
          })
        })
      }
    })
  }

  let accountsSectionHeight = 0
  if (creditorAccounts.length > 0) {
    accountsSectionHeight = 80 + creditorAccounts.reduce((sum, acc) => {
      return sum + (acc.cardNumber && acc.shebaNumber ? 140 : 105)
    }, 0)
  }

  const transfersHeight = result.transfers.length ? result.transfers.length * 115 : 170
  const baseHeight = 620 + transfersHeight + accountsSectionHeight + 200
  const height = Math.max(1200, baseHeight)

  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.direction = 'rtl'
  ctx.textAlign = 'right'

  const background = ctx.createLinearGradient(0, 0, 1080, height)
  background.addColorStop(0, '#17134f')
  background.addColorStop(0.52, '#4f46e5')
  background.addColorStop(1, '#8b5cf6')
  ctx.fillStyle = background
  ctx.fillRect(0, 0, 1080, height)

  ctx.fillStyle = 'rgba(255,255,255,.08)'
  ctx.beginPath(); ctx.arc(80, 120, 250, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(1010, height - 80, 300, 0, Math.PI * 2); ctx.fill()

  ctx.fillStyle = '#ffffff'; ctx.font = '400 66px Lalezar'; ctx.fillText('دنگ‌بان', 940, 115)
  ctx.font = '500 27px Estedad'; ctx.fillStyle = '#dcdafe'; ctx.fillText('تسویهٔ هوشمند هزینه‌های گروهی', 940, 157)
  ctx.textAlign = 'left'; ctx.font = '700 25px Estedad'; ctx.fillText(formatPersianDate(event.date), 140, 125); ctx.textAlign = 'right'

  // Event info box
  roundedRect(ctx, 80, 205, 920, 250, 42); ctx.fillStyle = 'rgba(255,255,255,.96)'; ctx.fill()
  ctx.fillStyle = '#6b7280'; ctx.font = '600 26px Estedad'; ctx.fillText('رویداد', 930, 270)
  ctx.fillStyle = '#171733'; fitText(ctx, event.title, 780, 54); ctx.fillText(event.title, 930, 335)
  ctx.fillStyle = '#4f46e5'; ctx.font = '800 42px Estedad'; ctx.fillText(formatMoney(result.total, event.currency), 930, 410)

  // Payments section
  ctx.fillStyle = '#ffffff'; ctx.font = '400 44px Lalezar'; ctx.fillText('پرداخت‌های نهایی', 950, 535)
  let y = 585
  if (!result.transfers.length) {
    roundedRect(ctx, 80, y, 920, 140, 30); ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fill()
    ctx.fillStyle = '#ffffff'; ctx.font = '700 31px Estedad'; ctx.fillText('🎉 حساب همه صاف است؛ پرداختی لازم نیست.', 930, y + 84)
    y += 170
  } else {
    result.transfers.forEach((transfer, index) => {
      const from = event.people.find((person) => person.id === transfer.from)?.name || 'نامشخص'
      const to = event.people.find((person) => person.id === transfer.to)?.name || 'نامشخص'
      roundedRect(ctx, 80, y, 920, 98, 25); ctx.fillStyle = index % 2 ? 'rgba(255,255,255,.10)' : 'rgba(255,255,255,.16)'; ctx.fill()
      ctx.fillStyle = '#ffffff'; ctx.font = '700 29px Estedad'; ctx.fillText(`${from} ← به ← ${to}`, 930, y + 61)
      ctx.textAlign = 'left'; ctx.fillStyle = '#ccfbf1'; ctx.font = '800 29px Estedad'; ctx.fillText(formatMoney(transfer.amount, event.currency), 140, y + 61); ctx.textAlign = 'right'
      y += 115
    })
  }

  // Bank accounts separate section
  if (creditorAccounts.length > 0) {
    y += 35
    ctx.fillStyle = '#ffffff'; ctx.font = '400 44px Lalezar'; ctx.fillText('شماره حساب‌ها جهت واریز', 950, y)
    y += 25

    for (const acc of creditorAccounts) {
      const hasBoth = acc.cardNumber && acc.shebaNumber
      const cardHeight = hasBoth ? 128 : 96

      roundedRect(ctx, 80, y, 920, cardHeight, 24)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
      ctx.fill()

      // Bank icon
      const bankImg = await loadBankImage(acc.bankKey)
      if (bankImg) {
        ctx.drawImage(bankImg, 930, y + 16, 44, 44)
      }

      // Person name and bank name
      ctx.fillStyle = '#1e1b4b'
      ctx.font = '800 26px Estedad'
      const titleX = bankImg ? 915 : 940
      ctx.fillText(`${acc.personName} (${acc.bankName || 'بانک'})`, titleX, y + 44)

      let lineY = y + 44
      if (acc.cardNumber) {
        lineY = hasBoth ? y + 80 : y + 78
        ctx.fillStyle = '#4b5563'
        ctx.font = '600 21px Estedad'
        ctx.fillText('شماره کارت:', titleX, lineY)

        ctx.textAlign = 'left'
        ctx.fillStyle = '#4338ca'
        ctx.font = '800 25px Estedad'
        ctx.fillText(formatCardNumber(acc.cardNumber), 120, lineY)
        ctx.textAlign = 'right'
      }

      if (acc.shebaNumber) {
        lineY = hasBoth ? y + 112 : y + 78
        ctx.fillStyle = '#6b7280'
        ctx.font = '600 19px Estedad'
        ctx.fillText('شماره شبا:', titleX, lineY)

        ctx.textAlign = 'left'
        ctx.fillStyle = '#1f2937'
        ctx.font = '700 21px Estedad'
        ctx.fillText(formatSheba(acc.shebaNumber), 120, lineY)
        ctx.textAlign = 'right'
      }

      y += cardHeight + 14
    }
  }

  // Footer
  ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(80, height - 150); ctx.lineTo(1000, height - 150); ctx.stroke()
  ctx.fillStyle = '#ffffff'; ctx.font = '400 38px Lalezar'; ctx.fillText('ساخته‌شده با دنگ‌بان', 950, height - 87)
  ctx.textAlign = 'left'; ctx.font = '700 27px Estedad'; ctx.fillStyle = '#ccfbf1'; ctx.fillText(SITE_URL, 130, height - 90)

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('ساخت تصویر ناموفق بود.'))), 'image/png', 0.95)
  )
}
