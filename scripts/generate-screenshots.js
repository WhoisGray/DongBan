/* global console, process, WebSocket, fetch, Buffer */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'

const PORT = 8123
const CDP_PORT = 9334
const DIST_DIR = path.resolve('dist')

const sampleData = {
  version: 3,
  settings: { theme: 'light', defaultCurrency: 'TOMAN', defaultRounding: 1000 },
  savedPeople: ['علی', 'سارا', 'مهدی', 'ساناز'],
  contacts: [
    {
      id: 'c1',
      name: 'علی',
      accounts: [
        {
          id: 'a1',
          cardNumber: '6219861912345678',
          shebaNumber: 'IR120170000000123456789012',
          bankKey: 'blu',
          bankName: 'بلوبانک'
        }
      ]
    },
    {
      id: 'c2',
      name: 'سارا',
      accounts: [
        {
          id: 'a2',
          cardNumber: '6037991122334455',
          shebaNumber: 'IR880180000000123456789012',
          bankKey: 'meli',
          bankName: 'بانک ملی'
        }
      ]
    }
  ],
  events: [
    {
      id: 'shomal-trip',
      title: 'سفر شمال با بچه‌ها 🌊',
      date: '2026-09-08',
      currency: 'TOMAN',
      roundingIncrement: 1000,
      note: 'متل قو و نمک‌آبرود - شهریور ۱۴۰۵',
      people: [
        { id: 'p1', name: 'علی' },
        { id: 'p2', name: 'سارا' },
        { id: 'p3', name: 'مهدی' },
        { id: 'p4', name: 'ساناز' }
      ],
      expenses: [
        {
          id: 'e1',
          title: 'اجاره ویلای متل قو (۲ شب)',
          amountMinor: 4800000,
          payerId: 'p1',
          category: 'stay',
          date: '2026-09-06',
          note: 'استخردار ساحلی',
          splits: { p1: 1, p2: 1, p3: 1, p4: 1 }
        },
        {
          id: 'e2',
          title: 'شام رستوران ماهی‌سرا و کته‌کبابی',
          amountMinor: 1450000,
          payerId: 'p2',
          category: 'food',
          date: '2026-09-07',
          note: 'شام دسته‌جمعی با مخلفات کامل',
          splits: { p1: 1, p2: 1, p3: 1, p4: 1 }
        },
        {
          id: 'e3',
          title: 'بنزین خودروها و عوارض آزادراه',
          amountMinor: 380000,
          payerId: 'p3',
          category: 'transport',
          date: '2026-09-06',
          note: '',
          splits: { p1: 1, p2: 1, p3: 1, p4: 1 }
        },
        {
          id: 'e4',
          title: 'خرید سوپرمارکت، تنقلات و عصرانه',
          amountMinor: 670000,
          payerId: 'p4',
          category: 'shopping',
          date: '2026-09-07',
          note: 'میوه، چای و خوراکی‌های بین‌راهی',
          splits: { p1: 1, p2: 1, p3: 1, p4: 1 }
        }
      ]
    },
    {
      id: 'tehran-home',
      title: 'هزینه‌های خانهٔ مشترک (شهریور) 🏠',
      date: '2026-09-01',
      currency: 'TOMAN',
      roundingIncrement: 1000,
      note: 'قبوض، اقلام مصرفی و اینترنت',
      people: [
        { id: 'h1', name: 'علی' },
        { id: 'h2', name: 'مهدی' }
      ],
      expenses: [
        {
          id: 'he1',
          title: 'شارژ ساختمان و نظافت',
          amountMinor: 950000,
          payerId: 'h1',
          category: 'other',
          date: '2026-09-01',
          note: '',
          splits: { h1: 1, h2: 1 }
        }
      ]
    }
  ],
  meta: { migratedAt: new Date().toISOString() }
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.json': 'application/json'
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  let filePath = path.join(DIST_DIR, url.pathname)

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html')
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    filePath = path.join(DIST_DIR, 'index.html')
  }

  const ext = path.extname(filePath)
  const contentType = mimeTypes[ext] || 'application/octet-stream'

  if (ext === '.html') {
    let html = fs.readFileSync(filePath, 'utf-8')
    // Hide update banner in screenshots and ensure zero horizontal overflow
    html = html.replace(
      '</head>',
      '<style>.update-banner { display: none !important; }</style></head>'
    )
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(html)
    return
  }

  res.writeHead(200, { 'Content-Type': contentType })
  fs.createReadStream(filePath).pipe(res)
})

class ChromeClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl
    this.ws = null
    this.id = 0
    this.callbacks = new Map()
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl)
      this.ws.onopen = resolve
      this.ws.onerror = reject
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.id && this.callbacks.has(data.id)) {
          const { resolve, reject } = this.callbacks.get(data.id)
          this.callbacks.delete(data.id)
          if (data.error) reject(new Error(data.error.message))
          else resolve(data.result)
        }
      }
    })
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.id
      this.callbacks.set(id, { resolve, reject })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }

  close() {
    if (this.ws) this.ws.close()
  }
}

async function waitForCdp(port, retries = 30) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`)
      if (res.ok) {
        const pages = await res.json()
        const page = pages.find((p) => p.type === 'page')
        if (page && page.webSocketDebuggerUrl) {
          return page.webSocketDebuggerUrl
        }
      }
    } catch {
      await new Promise((r) => setTimeout(r, 200))
    }
  }
  throw new Error('Could not connect to Chrome CDP')
}

server.listen(PORT, async () => {
  console.log(`Server started at http://localhost:${PORT}`)
  fs.mkdirSync('docs/screenshots', { recursive: true })
  fs.mkdirSync('public/screenshots', { recursive: true })

  const profileDir = path.resolve('node_modules/.cache/chrome-screenshots')
  fs.mkdirSync(profileDir, { recursive: true })

  const chrome = spawn(
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    [
      '--headless=new',
      '--hide-scrollbars',
      '--no-sandbox',
      `--user-data-dir=${profileDir}`,
      `--remote-debugging-port=${CDP_PORT}`,
      'about:blank'
    ],
    { stdio: 'ignore' }
  )

  const mobileUA =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
  const desktopUA =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

  try {
    const wsUrl = await waitForCdp(CDP_PORT)
    const client = new ChromeClient(wsUrl)
    await client.connect()
    await client.send('Page.enable')
    await client.send('Network.enable')
    await client.send('Runtime.enable')

    // Initial navigation to origin to populate localStorage directly
    console.log('Seeding mock data into localStorage...')
    await client.send('Page.navigate', { url: `http://localhost:${PORT}/` })
    await new Promise((r) => setTimeout(r, 600))
    await client.send('Runtime.evaluate', {
      expression: `localStorage.setItem('dongban:data', JSON.stringify(${JSON.stringify(sampleData)}));`
    })

    async function capture({ filename, url, width, height, deviceScaleFactor, isMobile, userAgent, waitMs = 1200 }) {
      await client.send('Network.setUserAgentOverride', {
        userAgent,
        platform: isMobile ? 'iPhone' : 'MacIntel'
      })
      await client.send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: deviceScaleFactor || 2,
        mobile: !!isMobile
      })
      await client.send('Emulation.setTouchEmulationEnabled', { enabled: !!isMobile })

      await client.send('Page.navigate', { url })
      // Allow router transition, fonts, and render to settle
      await new Promise((r) => setTimeout(r, waitMs))

      const res = await client.send('Page.captureScreenshot', { format: 'png' })
      const buffer = Buffer.from(res.data, 'base64')
      const outPath = path.join('docs/screenshots', filename)
      fs.writeFileSync(outPath, buffer)
      fs.copyFileSync(outPath, path.join('public/screenshots', filename))
      console.log(`Saved ${filename} (${width}x${height}${isMobile ? ' Mobile' : ' Desktop'})`)
    }

    console.log('1/5 Capturing Desktop Dashboard...')
    await capture({
      filename: 'desktop-dashboard.png',
      url: `http://localhost:${PORT}/`,
      width: 1280,
      height: 820,
      deviceScaleFactor: 2,
      isMobile: false,
      userAgent: desktopUA
    })

    console.log('2/5 Capturing Desktop Event Overview...')
    await capture({
      filename: 'desktop-event.png',
      url: `http://localhost:${PORT}/event/shomal-trip`,
      width: 1280,
      height: 820,
      deviceScaleFactor: 2,
      isMobile: false,
      userAgent: desktopUA
    })

    console.log('3/5 Capturing Desktop Settlement...')
    await capture({
      filename: 'desktop-settlement.png',
      url: `http://localhost:${PORT}/event/shomal-trip?tab=settlement`,
      width: 1280,
      height: 960,
      deviceScaleFactor: 2,
      isMobile: false,
      userAgent: desktopUA
    })

    console.log('4/5 Capturing Mobile Settlement (iPhone 390x844)...')
    await capture({
      filename: 'mobile-event.png',
      url: `http://localhost:${PORT}/event/shomal-trip?tab=settlement`,
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      isMobile: true,
      userAgent: mobileUA
    })

    console.log('5/5 Capturing Mobile Dashboard (iPhone 390x844)...')
    await capture({
      filename: 'mobile-dashboard.png',
      url: `http://localhost:${PORT}/`,
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      isMobile: true,
      userAgent: mobileUA
    })

    client.close()
    console.log('All screenshots captured successfully!')
  } catch (err) {
    console.error('Failed capturing:', err)
  } finally {
    chrome.kill()
    server.close()
    process.exit(0)
  }
})
